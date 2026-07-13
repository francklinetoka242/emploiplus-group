# src/features

## Rôle

Ce dossier contient les domaines métier de l’application. Chaque feature encapsule sa propre logique, ses composants, ses hooks et ses API.

## Ce qui doit y être placé

- logique métier liée à un domaine précis
- composants spécifiques à une feature
- hooks métier
- appels API liés à cette feature
- types propres à cette feature

## Ce qui ne doit jamais y être placé

- composants UI génériques
- logique d’authentification transversale non liée à la feature
- dépendances directes à une autre feature
