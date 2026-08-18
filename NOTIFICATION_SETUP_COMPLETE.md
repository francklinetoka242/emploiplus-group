# ✅ Configuration des Notifications - Terminée

## 📋 Résumé des modifications

Le système de notifications est maintenant **complètement fonctionnel**. Les admins peuvent créer et envoyer des notifications depuis le panel admin qui s'afficheront dans le compte candidat.

---

## ✨ Changements effectués

### 1. ✅ Hook `useNotifications.ts` - MODIFIÉ
**Fichier** : `src/hooks/useNotifications.ts`

**Modification** : Ajout du support des notifications de type `'offre'`
```typescript
// AVANT :
(notif.type === "admin" && ...)

// APRÈS :
(notif.type === "admin" || notif.type === "offre") && ...
```

**Impact** : Les candidats verront maintenant TOUS les types de notifications :
- `admin` : Notifications administratives
- `offre` : **Notifications d'offres d'emploi** ← NOUVEAU

### 2. ✅ Déclencheur automatique - CONFIRMÉ DÉSACTIVÉ
**Fichier** : `supabase/migrations/20260620174442_23c9bfed-04ff-4596-a2fe-353f1ffa3dd1.sql`

La fonction `notify_job_published()` est vide :
```sql
CREATE OR REPLACE FUNCTION public.notify_job_published()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Job publication notifications are disabled; only manual admin notifications are kept.
  RETURN NEW;
END $$;
```

**Impact** : Aucune notification n'est créée automatiquement lors de l'insertion d'offres d'emploi. ✅

### 3. 📝 Documentation SQL fournie
**Fichier** : `SQL_QUERIES_NOTIFICATIONS.md`

Contient 12 requêtes SQL prêtes à l'emploi pour :
- Créer des notifications manuelles
- Lister les notifications existantes
- Modifier le statut des notifications
- Supprimer des notifications
- Archiver les anciennes notifications

---

## 🚀 Comment l'utiliser

### Depuis l'interface admin (recommandé)

1. Allez à **http://localhost:5173/admin/notifications**
2. Remplissez le formulaire :
   - **Titre** : "Nouvelle offre d'emploi"
   - **Type** : Sélectionnez `"Offre"` (ou `"Admin"`)
   - **Message** : Votre texte
   - **Cible** : 
     - "Tous les candidats" = visible à tous
     - "Utilisateur spécifique" = visible à un seul candidat
   - **Statut** : Cochez "Actif"
3. Cliquez sur **"Créer la notification"**

### Les candidats verront la notification

1. Allez à **http://localhost:5173/candidate/notifications**
2. La notification apparaît dans la liste
3. Elle est marquée comme "Non lue" en bleu
4. Les candidats peuvent marquer comme lue ou supprimer

---

## 🔧 Architecture actuelle

### Table `notifications`
```
Colonnes principales :
├── id (UUID) - Identifiant unique
├── type (enum) - candidature, admin, evenement, offre, contact, job, blog
├── title (text) - Titre de la notification
├── content (text) - Contenu/description
├── user_id (UUID) - NULL = pour tous, sinon UUID du candidat
├── status (enum) - active, masked
├── is_read (boolean) - false au départ
├── created_at (timestamptz) - Date de création
└── read_at (timestamptz) - Date de lecture
```

### Flux actuel
```
Admin crée une notification
        ↓
INSERT INTO notifications (type: 'offre', ...)
        ↓
Candidats accèdent /candidate/notifications
        ↓
useNotifications hook filtre :
  - status = 'active'
  - type IN ('admin', 'offre')  ← NOUVEAU
  - user_id IS NULL OR user_id = auth.uid()
        ↓
Les notifications s'affichent
```

---

## ✅ Checklist de vérification

- [x] Les admins peuvent créer des notifications
- [x] Les notifications de type 'offre' apparaissent chez les candidats
- [x] Les notifications de type 'admin' apparaissent toujours
- [x] La création automatique est désactivée
- [x] Les candidats peuvent marquer comme lue
- [x] Les candidats peuvent supprimer une notification
- [x] Filtrage par statut (active/masked) fonctionne
- [x] Filtrage par utilisateur fonctionne

---

## 📊 Requêtes SQL utiles

### Créer une notification d'offre pour TOUS les candidats
```sql
INSERT INTO public.notifications (
  user_id, type, title, content, status, is_read, created_at
) VALUES (
  NULL,
  'offre'::public.notification_type,
  'Nouvelle offre: [Titre]',
  'Description complète...',
  'active'::public.notification_status,
  false,
  now()
);
```

### Créer une notification pour UN candidat
```sql
INSERT INTO public.notifications (
  user_id, type, title, content, status, is_read, created_at
) VALUES (
  'uuid-du-candidat',
  'offre'::public.notification_type,
  'Offre spéciale pour vous',
  'Description...',
  'active'::public.notification_status,
  false,
  now()
);
```

### Voir les notifications actives
```sql
SELECT id, type, title, user_id, created_at
FROM public.notifications
WHERE status = 'active'::public.notification_status
ORDER BY created_at DESC;
```

---

## 🐛 Dépannage

### Les notifications n'apparaissent pas ?
1. **Vérifiez le statut** : `SELECT * FROM notifications WHERE id = 'xxx';`
2. **Vérifiez le type** : Doit être `'offre'` ou `'admin'`
3. **Vérifiez l'utilisateur** : `user_id` doit être NULL ou l'UUID du candidat
4. **Videz le cache** : Ctrl+Shift+Suppr dans le navigateur
5. **Rechargez** : F5

### Comment créer une notification pour un groupe spécifique ?
Actuellement, il y a deux options :
1. **Pour TOUS** : Créer avec `user_id = NULL`
2. **Pour UN** : Créer plusieurs notifications avec `user_id` spécifique

Future amélioration : créer un système de segments/groupes de candidats

---

## 📚 Fichiers modifiés

| Fichier | Type | Modification |
|---------|------|--------------|
| `src/hooks/useNotifications.ts` | Code | ✏️ Ajout du type 'offre' |
| `SQL_QUERIES_NOTIFICATIONS.md` | Documentation | 📝 Nouveau fichier |
| `NOTIFICATION_SETUP_COMPLETE.md` | Documentation | 📝 Ce fichier |

---

## ⚡ Performance & Sécurité

- **Indexes créés** ✅
  - `idx_notifications_status`
  - `idx_notifications_user`
  - `idx_notifications_created_at`

- **Policies de sécurité** ✅
  - Les candidats ne voient que leurs notifications + les publiques
  - Les admins gèrent les notifications
  - Les candidats peuvent modifier/supprimer leurs propres notifications

---

## 🎯 Prochaines étapes (optionnel)

1. **Améliorer le filtrage** : Permettre aux admins de cibler par localisation, type de contrat, etc.
2. **Planifier les notifications** : Créer des notifications futures
3. **Statistiques** : Voir combien de candidats ont lu chaque notification
4. **Modèles** : Créer des modèles de notifications prédéfinies
5. **Email** : Envoyer aussi par email (intégration avec Resend)

---

## 🔗 Ressources

- Panel Admin : http://localhost:5173/admin/notifications
- Page Candidat : http://localhost:5173/candidate/notifications
- Requêtes SQL : Voir `SQL_QUERIES_NOTIFICATIONS.md`

---

**Status** : ✅ Prêt pour la production

Date : 2026-08-18
