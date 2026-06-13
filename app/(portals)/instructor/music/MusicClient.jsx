"use client";

import { useState } from "react";
import { Music, Plus, Trash2, ListMusic, Play, Disc3, X, Pencil, Check } from "lucide-react";
import styles from "./music.module.css";

const MOODS = ["Warm-up", "Groove", "Peak", "Cool-down"];

const MOOD_BADGE = {
  "Warm-up": "p-badge-warn",
  Groove: "p-badge-vip",
  Peak: "p-badge-hot",
  "Cool-down": "p-badge-cool",
};

function moodBadgeClass(mood) {
  return MOOD_BADGE[mood] || "p-badge-cool";
}

const EMPTY_TRACK = { title: "", artist: "", duration: "", mood: "Groove", bpm: "" };

export default function MusicClient({ initialTracks, initialPlaylists }) {
  const [tracks, setTracks] = useState(initialTracks || []);
  const [playlists, setPlaylists] = useState(initialPlaylists || []);
  const [form, setForm] = useState(EMPTY_TRACK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // playlist builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [plName, setPlName] = useState("");
  const [plPicks, setPlPicks] = useState([]);
  const [plBusy, setPlBusy] = useState(false);

  // rename state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  function trackById(id) {
    return tracks.find((t) => t.id === id);
  }

  async function addTrack(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Give the track a title first.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/instructor/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          artist: form.artist.trim(),
          duration: form.duration.trim(),
          mood: form.mood,
          bpm: form.bpm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add the track.");
        return;
      }
      setTracks((prev) => [data.track, ...prev]);
      setForm(EMPTY_TRACK);
    } catch {
      setError("Network hiccup. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTrack(id) {
    const snapshot = tracks;
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setPlaylists((prev) =>
      prev.map((p) => ({ ...p, trackIds: p.trackIds.filter((tid) => tid !== id) }))
    );
    try {
      const res = await fetch(`/api/instructor/tracks/${id}`, { method: "DELETE" });
      if (!res.ok) setTracks(snapshot);
    } catch {
      setTracks(snapshot);
    }
  }

  function togglePick(id) {
    setPlPicks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function openBuilder() {
    setPlName("");
    setPlPicks([]);
    setShowBuilder(true);
  }

  async function createPlaylist(e) {
    e.preventDefault();
    setPlBusy(true);
    try {
      const res = await fetch("/api/instructor/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: plName.trim() || "New playlist", trackIds: plPicks }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlaylists((prev) => [data.playlist, ...prev]);
        setShowBuilder(false);
      }
    } catch {
      /* keep builder open on failure */
    } finally {
      setPlBusy(false);
    }
  }

  async function deletePlaylist(id) {
    const snapshot = playlists;
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/instructor/playlists/${id}`, { method: "DELETE" });
      if (!res.ok) setPlaylists(snapshot);
    } catch {
      setPlaylists(snapshot);
    }
  }

  function startRename(pl) {
    setEditingId(pl.id);
    setEditName(pl.name);
  }

  async function saveRename(id) {
    const name = editName.trim();
    if (!name) {
      setEditingId(null);
      return;
    }
    const snapshot = playlists;
    setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
    setEditingId(null);
    try {
      const res = await fetch(`/api/instructor/playlists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) setPlaylists(snapshot);
    } catch {
      setPlaylists(snapshot);
    }
  }

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div>
          <div className="p-overline">Studio Sound</div>
          <h1 className={`p-display ${styles.title}`}>Music Library</h1>
        </div>
        <span className={`p-badge p-badge-cool ${styles.subBadge}`}>
          <Disc3 size={12} /> {tracks.length} tracks · {playlists.length} playlists
        </span>
      </header>
      <p className={styles.blurb}>
        Build the soundtrack for your floor. Add tracks by mood and energy, then group them into
        playlists for each class.
      </p>

      {/* Add a track */}
      <section className={`p-card ${styles.formCard}`}>
        <div className={styles.sectionHead}>
          <Plus size={16} />
          <span className={styles.sectionLabel}>Add a track</span>
        </div>
        <form className={styles.form} onSubmit={addTrack}>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Title</span>
              <input
                className={styles.input}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Marigold Drums"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Artist</span>
              <input
                className={styles.input}
                value={form.artist}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
                placeholder="Thayya Sessions"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Duration</span>
              <input
                className={styles.input}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="3:45"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Mood</span>
              <select
                className={styles.input}
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: e.target.value })}
              >
                {MOODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>BPM</span>
              <input
                className={styles.input}
                type="number"
                value={form.bpm}
                onChange={(e) => setForm({ ...form, bpm: e.target.value })}
                placeholder="120"
              />
            </label>
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button type="submit" className={`p-pill p-pill-primary ${styles.submit}`} disabled={busy}>
            <Plus size={16} /> {busy ? "Adding…" : "Add track"}
          </button>
        </form>
      </section>

      {/* Your tracks */}
      <div className={styles.sectionTitleRow}>
        <div className="p-overline">Your tracks</div>
      </div>
      {tracks.length === 0 ? (
        <div className={`p-card ${styles.emptyRow}`}>No tracks yet — add your first above.</div>
      ) : (
        <div className={`p-card ${styles.trackList}`}>
          {tracks.map((t, i) => (
            <div key={t.id} className={styles.track}>
              <span className={`p-av-${(i % 6) + 1} ${styles.trackIcon}`}>
                <Music size={16} />
              </span>
              <div className={styles.trackInfo}>
                <div className={styles.trackTop}>
                  <span className={styles.trackName}>{t.title}</span>
                  <span className={`p-badge ${moodBadgeClass(t.mood)}`}>{t.mood}</span>
                </div>
                <div className={styles.trackMeta}>
                  <span>{t.artist}</span>
                  {t.bpm ? <span>· {t.bpm} BPM</span> : null}
                  <span>· {t.duration}</span>
                  <span className={styles.trackSource}>· {t.source}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => removeTrack(t.id)}
                aria-label={`Remove ${t.title}`}
                title="Remove track"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Playlists */}
      <div className={styles.sectionTitleRow}>
        <div className="p-overline">Playlists</div>
        <button type="button" className={`p-pill p-pill-ghost ${styles.smallPill}`} onClick={openBuilder}>
          <Plus size={14} /> New playlist
        </button>
      </div>

      {showBuilder ? (
        <section className={`p-card ${styles.builder}`}>
          <div className={styles.sectionHead}>
            <ListMusic size={16} />
            <span className={styles.sectionLabel}>Create a playlist</span>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setShowBuilder(false)}
              aria-label="Close playlist builder"
            >
              <X size={16} />
            </button>
          </div>
          <form className={styles.form} onSubmit={createPlaylist}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Playlist name</span>
              <input
                className={styles.input}
                value={plName}
                onChange={(e) => setPlName(e.target.value)}
                placeholder="Friday Night Floor"
              />
            </label>
            <div className={styles.fieldLabel}>Pick tracks</div>
            {tracks.length === 0 ? (
              <p className={styles.error}>Add a track first to fill a playlist.</p>
            ) : (
              <div className={styles.pickList}>
                {tracks.map((t) => (
                  <label key={t.id} className={styles.pick}>
                    <input
                      type="checkbox"
                      checked={plPicks.includes(t.id)}
                      onChange={() => togglePick(t.id)}
                    />
                    <span className={styles.pickName}>{t.title}</span>
                    <span className={`p-badge ${moodBadgeClass(t.mood)}`}>{t.mood}</span>
                  </label>
                ))}
              </div>
            )}
            <button
              type="submit"
              className={`p-pill p-pill-primary ${styles.submit}`}
              disabled={plBusy}
            >
              <Check size={16} /> {plBusy ? "Saving…" : "Save playlist"}
            </button>
          </form>
        </section>
      ) : null}

      {playlists.length === 0 ? (
        <div className={`p-card ${styles.emptyRow}`}>
          No playlists yet — group your tracks into a set for your next class.
        </div>
      ) : (
        <div className={styles.playlistGrid}>
          {playlists.map((p) => (
            <div key={p.id} className={`p-card ${styles.playlist}`}>
              <div className={styles.playlistHead}>
                <span className={`p-av-3 ${styles.playlistIcon}`}>
                  <ListMusic size={18} />
                </span>
                <div className={styles.playlistTitleWrap}>
                  {editingId === p.id ? (
                    <div className={styles.renameRow}>
                      <input
                        className={styles.input}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => saveRename(p.id)}
                        aria-label="Save name"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className={`p-display ${styles.playlistName}`}>{p.name}</div>
                  )}
                  <div className={styles.playlistCount}>
                    {p.trackIds.length} {p.trackIds.length === 1 ? "track" : "tracks"}
                  </div>
                </div>
                <div className={styles.playlistActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => startRename(p)}
                    aria-label={`Rename ${p.name}`}
                    title="Rename"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => deletePlaylist(p.id)}
                    aria-label={`Delete ${p.name}`}
                    title="Delete playlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className={styles.playlistTracks}>
                {p.trackIds.length === 0 ? (
                  <div className={styles.emptyMini}>No tracks in this set.</div>
                ) : (
                  p.trackIds.map((tid) => {
                    const t = trackById(tid);
                    if (!t) return null;
                    return (
                      <div key={tid} className={styles.miniTrack}>
                        <Play size={13} className={styles.miniPlay} />
                        <span className={styles.miniName}>{t.title}</span>
                        <span className={styles.miniDur}>{t.duration}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
