# Requêtes SQL pour la Gestion des Notifications

## Vue d'ensemble
Le système de notifications est maintenant fonctionnel :
- Les admins peuvent créer des notifications depuis `/admin/notifications`
- Les candidats voient les notifications de type `offre` et `admin` dans `/candidate/notifications`
- La création automatique de notifications lors de l'insertion d'offres est **désactivée**

---

## 1. Vérifier l'état de la table `notifications`

```sql
-- Voir la structure complète
\d public.notifications

-- Vérifier que les colonnes existent
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notifications'
ORDER BY ordinal_position;
```

---

## 2. Vérifier que le trigger automatique est désactivé

```sql
-- Voir le contenu du trigger
SELECT pg_get_triggerdef(oid) 
FROM pg_trigger 
WHERE tgname = 'trg_notify_job_published';

-- Vérifier que la fonction ne fait rien
SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
WHERE p.proname = 'notify_job_published';
```

**Résultat attendu** : La fonction `notify_job_published()` contient uniquement `RETURN NEW;` sans créer de notifications.

---

## 3. Créer une notification d'offre d'emploi (Depuis l'admin)

```sql
-- Créer une notification visible à TOUS les candidats
INSERT INTO public.notifications (
  user_id,
  type,
  title,
  body,
  content,
  status,
  is_read,
  created_at
) VALUES (
  NULL,  -- NULL = visible à tous les candidats
  'offre'::public.notification_type,
  'Nouvelle offre: Développeur Senior',
  'Une nouvelle offre d''emploi CDI à temps plein',
  'Une nouvelle offre d''emploi CDI à temps plein en tant que Développeur Senior chez notre entreprise. Expérience requise: 5 ans minimum.',
  'active'::public.notification_status,
  false,
  now()
);
```

---

## 4. Créer une notification pour un candidat spécifique

```sql
-- Créer une notification pour un candidat particulier
INSERT INTO public.notifications (
  user_id,
  type,
  title,
  body,
  content,
  status,
  is_read,
  created_at
) VALUES (
  'uuid-du-candidat-ici',  -- Remplacer par l'UUID réel
  'offre'::public.notification_type,
  'Offre spéciale pour vous',
  'Titre court',
  'Description longue de la notification...',
  'active'::public.notification_status,
  false,
  now()
);
```

---

## 5. Lister les notifications actives d'offres d'emploi

```sql
-- Voir toutes les notifications d'offres
SELECT id, user_id, title, content, status, is_read, created_at
FROM public.notifications
WHERE type = 'offre'::public.notification_type
AND status = 'active'::public.notification_status
ORDER BY created_at DESC;
```

---

## 6. Lister les notifications d'un candidat spécifique

```sql
-- Remplacer 'uuid-candidat' par l'UUID réel
SELECT id, type, title, content, status, is_read, created_at
FROM public.notifications
WHERE status = 'active'::public.notification_status
AND (user_id IS NULL OR user_id = 'uuid-candidat')
ORDER BY created_at DESC;
```

---

## 7. Mettre à jour le statut d'une notification (Actif/Masqué)

```sql
-- Masquer une notification
UPDATE public.notifications
SET status = 'masked'::public.notification_status
WHERE id = 'uuid-notification-ici';

-- La réactiver
UPDATE public.notifications
SET status = 'active'::public.notification_status
WHERE id = 'uuid-notification-ici';
```

---

## 8. Supprimer une notification

```sql
DELETE FROM public.notifications
WHERE id = 'uuid-notification-ici';
```

---

## 9. Marquer une notification comme lue

```sql
UPDATE public.notifications
SET is_read = true, read_at = now()
WHERE id = 'uuid-notification-ici';
```

---

## 10. Vérifier que le trigger automatique n'a rien créé

```sql
-- Voir le nombre de notifications créées automatiquement depuis une date
SELECT COUNT(*), type
FROM public.notifications
WHERE created_at > now() - interval '7 days'
GROUP BY type;

-- Les notifications de type 'offre' doivent être créées MANUELLEMENT via l'admin
-- Aucune ne devrait être générée automatiquement par les triggers
```

---

## 11. Ajouter des indexes pour optimiser les requêtes

```sql
-- Ces indexes améliorent les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_status_created 
ON public.notifications(user_id, status, created_at DESC)
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_notifications_type_status_created 
ON public.notifications(type, status, created_at DESC)
WHERE status = 'active';
```

---

## 12. Archiver les anciennes notifications

```sql
-- Masquer les notifications de plus de 30 jours
UPDATE public.notifications
SET status = 'masked'::public.notification_status
WHERE created_at < now() - interval '30 days'
AND status = 'active'::public.notification_status;
```

---

## Types de notifications disponibles

- `admin` - Notifications administratives générales
- `offre` - **Notifications d'offres d'emploi** (utilisé par le système actuel)
- `candidature` - Notifications sur les candidatures
- `evenement` - Notifications d'événements
- `contact` - Messages de contact (créés automatiquement)
- `job` - Variant pour les offres d'emploi
- `blog` - Notifications de blog

---

## Bonnes pratiques

1. **Avant de créer une notification** : Vérifiez que c'est vraiment nécessaire
2. **Utilisez `user_id = NULL`** : Pour envoyer à tous les candidats
3. **Masquez plutôt que supprimez** : Pour conserver l'historique
4. **Testez d'abord** : Créez une notification pour un candidat test
5. **Vérifiez la page** : Les notifications peuvent mettre quelques secondes à s'afficher

---

## Dépannage

### Les notifications n'apparaissent pas chez les candidats
1. Vérifiez que `status = 'active'`
2. Vérifiez que `user_id IS NULL` ou correspond à l'UUID du candidat
3. Vérifiez que le type est `'offre'` ou `'admin'`
4. Videz le cache du navigateur (Ctrl+Maj+Suppr)
5. Rechargez la page

### Combien de notifications peut-on avoir ?
Il n'y a pas de limite stricte, mais pour les performances, archivez les anciennes (masquez-les après 30-60 jours).

### Comment envoyer uniquement à des candidats avec certains critères ?
Actuellement, vous devez :
1. Identifier manuellement les `user_id` concernés
2. Créer une notification par candidat OU créer une seule notification avec `user_id = NULL` (pour tous)

Future amélioration possible : créer un système de segmentation des candidats.
