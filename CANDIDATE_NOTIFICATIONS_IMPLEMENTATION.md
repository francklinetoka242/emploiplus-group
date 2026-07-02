# Système de Notifications pour les Candidats - Documentation

## Vue d'ensemble

Le système de notifications pour les candidats a été entièrement modernisé et rendu dynamique. Il offre maintenant:

1. **Barre de navigation améliorée**: Affichage en temps réel des notifications avec un badge de compteur
2. **Dropdown de notifications**: Aperçu rapide des 5 dernières notifications directement dans la topbar
3. **Page de notifications complète**: Liste détaillée de toutes les notifications avec filtrage
4. **Gestion des notifications**: Marquer comme lu, supprimer, marquer tout comme lu

## Composants créés/modifiés

### 1. Hook `useNotifications` ([src/hooks/useNotifications.ts](src/hooks/useNotifications.ts))

Hook React personnalisé pour gérer l'état et les interactions des notifications.

**Fonctionnalités:**
- Récupération automatique des notifications au montage
- Souscription aux mises à jour en temps réel via Supabase Realtime
- Calcul du nombre de notifications non lues
- Méthodes pour marquer comme lu, supprimer
- Gestion d'erreurs appropriée

**Utilisation:**
```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications();
  
  // Utiliser les données...
}
```

### 2. Composant `NotificationsDropdown` ([src/components/candidate/NotificationsDropdown.tsx](src/components/candidate/NotificationsDropdown.tsx))

Composant dropdown affichant les notifications récentes directement dans la topbar.

**Caractéristiques:**
- Badge de compteur dynamique
- Affichage des 5 dernières notifications
- Actions rapides: marquer comme lu, supprimer
- Lien vers la page complète des notifications
- Design responsive et accessible

### 3. Mise à jour `CandidateTopbar` ([src/components/candidate/CandidateTopbar.tsx](src/components/candidate/CandidateTopbar.tsx))

Intégration du système de notifications et utilisation des données réelles du profil candidat.

**Changements:**
- ✅ Affichage dynamique des données utilisateur (nom, email, avatar)
- ✅ Icône de notifications fonctionnelle avec dropdown
- ✅ Badge de compteur de notifications non lues
- ✅ Récupération des données réelles via `useCandidate` et `useNotifications`
- ✅ Suppression des props mockées

### 4. Mise à jour `CandidateNotificationsPage` ([src/pages/candidate/CandidateNotificationsPage.tsx](src/pages/candidate/CandidateNotificationsPage.tsx))

Rénovation complète de la page de notifications.

**Améliorations:**
- Utilisation du hook `useNotifications` pour plus de clarté
- Interactions améliorées: cliquer sur une notification la marque comme lue
- Affichage du timestamp complet au survol
- Gestion d'erreurs plus robuste
- Indicateurs de chargement avec animations

### 5. Migration Supabase ([supabase/migrations/20260702_create_candidate_notifications_system.sql](supabase/migrations/20260702_create_candidate_notifications_system.sql))

Amélioration de la base de données pour les notifications des candidats.

**Contient:**
- Triggers automatiques pour les changements de statut de candidature
- Triggers pour les offres d'emploi correspondantes
- Indexes optimisés pour les requêtes de notifications
- Fonctions plpgsql pour la logique métier

## Architecture

```
┌─────────────────────────────────────────┐
│         CandidateTopbar                 │
│  (Affiche le badge de notifications)    │
├─────────────────────────────────────────┤
│   ├─→ useCandidate                      │
│   │    (Données utilisateur réelles)    │
│   └─→ useNotifications (hook)           │
│        ├─→ fetchNotifications()         │
│        ├─→ Realtime subscription        │
│        └─→ CRUD operations              │
├─────────────────────────────────────────┤
│     NotificationsDropdown                │
│  (Aperçu rapide 5 dernières)            │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ CandidateNotificationsPage              │
│  (Liste complète avec tous les détails) │
└─────────────────────────────────────────┘
```

## Flux de données

1. **Initialisation** → `CandidateTopbar` monte → `useNotifications` charge les données
2. **Affichage** → Données affichées dans le dropdown et la page
3. **Actions utilisateur** → Clic sur notification → `markAsRead()` / `deleteNotification()`
4. **Mises à jour BD** → Supabase met à jour la table notifications
5. **Realtime** → Souscription Realtime notifie les changements → Re-render automatique

## Types de notifications

Le système supporte les types de notifications suivants:

- `candidature`: Mise à jour sur les candidatures (présélection, acceptation, rejet)
- `offre`: Nouvelles offres d'emploi correspondantes
- `evenement`: Événements de recrutement
- `job`: Offres d'emploi générales
- `contact`: Messages de contact
- `blog`: Mises à jour blog
- `admin`: Notifications administratives

## Statuts de notification

- `active`: Notification visible et active
- `masked`: Notification masquée (archivée mais conservée)

## Utilisation dans les pages

### Dans CandidateLayout

```tsx
export function CandidateLayout() {
  // CandidateTopbar utilise automatiquement useNotifications
  return (
    <div className="flex h-screen">
      <CandidateSidebar />
      <div className="flex flex-col flex-1">
        {/* Topbar automatiquement avec notifications */}
        <CandidateTopbar onMenuToggle={handleToggle} />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### Accès à la page complète

Les utilisateurs peuvent accéder à la page complète via:
- Le lien "Voir toutes les notifications" dans le dropdown
- Le menu sidebar
- URL directe: `/candidate/notifications`

## Fonctionnalités en temps réel

Grâce aux Realtime de Supabase, les notifications se mettent à jour automatiquement lorsque:
- Un nouvel événement est créé
- Une notification existante est modifiée (marquée comme lue, supprimée)
- Un changement de statut de candidature crée une nouvelle notification

## Optimisations de performance

1. **Indexes sur les requêtes fréquentes**:
   - `idx_notifications_user_id_status_created_at`
   - `idx_notifications_user_id_is_read_created_at`

2. **Virtualisation possible** pour de grandes listes (à implémenter si nécessaire)

3. **Memoization** dans les composants React pour éviter les re-renders inutiles

## Améliorations futures possibles

1. ✅ Notifications par email/push
2. ✅ Préférences de notifications par utilisateur
3. ✅ Groupement des notifications par type
4. ✅ Pagination ou virtualisation pour grandes listes
5. ✅ Archivage automatique des anciennes notifications
6. ✅ Catégories/tags pour les notifications

## Dépannage

### Les notifications ne s'affichent pas
1. Vérifier que l'utilisateur est authentifié
2. Vérifier que `user_id` est défini correctement dans la BD
3. Consulter la console pour les erreurs

### Les notifications ne se mettent pas à jour en temps réel
1. Vérifier que Realtime est activé dans Supabase
2. Vérifier les permissions Row Level Security (RLS)
3. Vérifier la connexion WebSocket

### Erreurs de type TypeScript
1. Vérifier que tous les imports sont corrects
2. Vérifier que `NotificationRecord` type correspond à la structure BD

## Tester le système

1. Accéder à `/candidate/dashboard`
2. Observer l'icône de notifications dans la topbar
3. Cliquer sur l'icône pour voir le dropdown
4. Marquer les notifications comme lues
5. Accéder à `/candidate/notifications` pour voir la liste complète
