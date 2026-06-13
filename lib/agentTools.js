// Tool definitions + server-side executors for the Thayya assistant.
//
// Trust boundary: the LLM may only REQUEST a tool by name with arguments.
// runTool() validates and executes against lib/db, always scoped to the
// authenticated session user passed in by the route handler. The model never
// touches the data store directly. create_booking is the only mutating tool.

import {
  listWorkshops,
  listBookingsForUser,
  findUserById,
  findWorkshopByQuery,
  createBooking,
} from "./db";

// OpenAI-style function definitions advertised to the model.
export const TOOL_DEFS = [
  {
    type: "function",
    function: {
      name: "list_classes",
      description:
        "List all available Thayya dance classes and workshops with their id, title, instructor, date, time, price, and spots left.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_my_bookings",
      description:
        "List the signed-in member's own bookings (classes they have reserved), with title, instructor, date, time, and status.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_membership",
      description:
        "Get the signed-in member's membership name and current points balance.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_booking",
      description:
        "Book the signed-in member into a class. Provide the class name or id. Resolves the class by fuzzy title match and reserves a spot.",
      parameters: {
        type: "object",
        properties: {
          workshop: {
            type: "string",
            description: "The class name or id to book, e.g. 'Aaja Nachle Intensive'.",
          },
        },
        required: ["workshop"],
      },
    },
  },
];

function classSummary(w) {
  return {
    id: w.id,
    title: w.title,
    instructor: w.instructor,
    date: w.date,
    time: w.time,
    price: w.price,
    spotsLeft: w.spotsLeft,
  };
}

// Execute a tool by name. Always returns a plain object (never throws).
export async function runTool(name, args, user) {
  try {
    if (!user || !user.id) return { error: "You need to be signed in." };

    switch (name) {
      case "list_classes": {
        const classes = listWorkshops().map(classSummary);
        return { classes };
      }

      case "list_my_bookings": {
        const bookings = listBookingsForUser(user.id).map((b) => ({
          id: b.id,
          title: b.title,
          instructor: b.instructor,
          date: b.date,
          time: b.time,
          price: b.price,
          status: b.status,
        }));
        return { bookings };
      }

      case "get_membership": {
        const full = findUserById(user.id);
        if (!full) return { error: "Could not find your membership." };
        return { name: full.name, points: full.points || 0 };
      }

      case "create_booking": {
        const query = args && typeof args.workshop === "string" ? args.workshop : "";
        if (!query.trim()) {
          return {
            error: "Tell me which class to book.",
            validClasses: listWorkshops().map((w) => w.title),
          };
        }
        const w = findWorkshopByQuery(query);
        if (!w) {
          return {
            error: "No matching class",
            validClasses: listWorkshops().map((w) => w.title),
          };
        }
        const { booking, alreadyBooked } = createBooking({
          userId: user.id,
          workshopId: w.id,
        });
        return {
          booked: true,
          alreadyBooked,
          title: booking.title,
          instructor: booking.instructor,
          date: booking.date,
          time: booking.time,
          price: booking.price,
        };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch {
    return { error: "Something went wrong running that. Try again?" };
  }
}
