'use client'

import { useState, useEffect, useCallback } from 'react'

interface Recipient {
  id: number
  name: string
  phoneNumber: string
  apiKey: string
  active: boolean
}

export default function AdminNotifications() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newApiKey, setNewApiKey] = useState('')
  const [error, setError] = useState('')

  const fetchRecipients = useCallback(async () => {
    const res = await fetch('/api/admin/recipients', {
      headers: { 'X-Admin-Password': password },
    })
    if (res.ok) {
      const data = await res.json()
      setRecipients(data.recipients)
    }
  }, [password])

  useEffect(() => {
    if (authed) fetchRecipients()
  }, [authed, fetchRecipients])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/recipients', {
      headers: { 'X-Admin-Password': password },
    })
    if (res.ok) {
      setAuthed(true)
      setError('')
    } else {
      setError('Mot de passe incorrect')
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/recipients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': password,
      },
      body: JSON.stringify({ name: newName, phoneNumber: newPhone, apiKey: newApiKey }),
    })
    setNewName('')
    setNewPhone('')
    setNewApiKey('')
    await fetchRecipients()
  }

  const toggleActive = async (id: number, active: boolean) => {
    await fetch('/api/admin/recipients', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': password,
      },
      body: JSON.stringify({ id, active: !active }),
    })
    await fetchRecipients()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce destinataire ?')) return
    await fetch('/api/admin/recipients', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': password,
      },
      body: JSON.stringify({ id }),
    })
    await fetchRecipients()
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <form onSubmit={handleLogin} className="glass-card p-8 w-80">
          <h1 className="font-beaufort text-xl text-accent-gold mb-4">Admin Notifications</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full px-3 py-2 rounded bg-bg-secondary border border-accent-gold/20 text-text-primary mb-3"
          />
          {error && <p className="text-accent-red text-sm mb-2">{error}</p>}
          <button className="w-full py-2 bg-accent-gold/20 border border-accent-gold/40 rounded text-accent-gold hover:bg-accent-gold/30 transition-colors">
            Connexion
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-beaufort text-2xl text-accent-gold mb-8">Destinataires WhatsApp</h1>

        {/* Add form */}
        <form onSubmit={handleAdd} className="glass-card p-6 mb-8">
          <h2 className="text-accent-gold-light text-sm uppercase tracking-wider mb-4">Ajouter un destinataire</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom"
              required
              className="px-3 py-2 rounded bg-bg-secondary border border-accent-gold/20 text-text-primary"
            />
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+33XXXXXXXXX"
              required
              className="px-3 py-2 rounded bg-bg-secondary border border-accent-gold/20 text-text-primary"
            />
            <input
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="API Key Callmebot"
              required
              className="px-3 py-2 rounded bg-bg-secondary border border-accent-gold/20 text-text-primary"
            />
          </div>
          <button className="px-4 py-2 bg-accent-green/20 border border-accent-green/40 rounded text-accent-green hover:bg-accent-green/30 transition-colors">
            Ajouter
          </button>
        </form>

        {/* Recipients list */}
        <div className="space-y-2">
          {recipients.map((r) => (
            <div key={r.id} className="glass-card px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-accent-gold-light">{r.name}</span>
                <span className="text-text-secondary text-sm ml-3">{r.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(r.id, r.active)}
                  className={`px-3 py-1 rounded text-xs ${
                    r.active
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-accent-red/20 text-accent-red'
                  }`}
                >
                  {r.active ? 'Actif' : 'Inactif'}
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="px-3 py-1 rounded text-xs bg-accent-red/10 text-accent-red hover:bg-accent-red/20"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {recipients.length === 0 && (
            <p className="text-text-secondary text-center py-8">Aucun destinataire configuré</p>
          )}
        </div>
      </div>
    </div>
  )
}
