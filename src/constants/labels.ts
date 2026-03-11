import { UserRole } from '../types/auth';
import { TaskPriority, TaskScope, TaskStatus } from '../types/task';

export const roleLabelFr: Record<UserRole, string> = {
  cto: 'CTO',
  lead_dev: 'Lead Dev',
  developer: 'Développeur',
  po: 'Product Owner',
};

export const statusLabelFr: Record<TaskStatus, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  blocked: 'Bloqué',
  in_review: 'En review',
  waiting_for_test: 'En attente de test',
  tested: 'Testée',
  deployed: 'Déployé',
};

export const priorityLabelFr: Record<TaskPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

export const scopeLabelFr: Record<TaskScope, string> = {
  visible: 'Visibles',
  created: 'Créées par moi',
  assigned: 'Assignées à moi',
  unassigned: "En attente d'assignation",
};

export const commonLabels = {
  appName: 'TaskCollab',
  loadingSession: 'Restauration de la session...',
  unauthorizedTitle: 'Accès refusé',
  unauthorizedSubtitle: "Vous n'êtes pas autorisé à accéder à cet écran.",
  retry: 'Réessayer',
  back: 'Retour',
  save: 'Enregistrer',
  update: 'Mettre à jour',
  delete: 'Supprimer',
  cancel: 'Annuler',
  confirm: 'Confirmer',
  logout: 'Se déconnecter',
  loadingData: 'Chargement des données...',
  fallbackOffline: 'API indisponible. Affichage des dernières données locales.',
  confirmDeleteTaskTitle: 'Supprimer la tâche',
  confirmDeleteTaskMessage: 'Voulez-vous vraiment supprimer cette tâche ?',
};

export const emptyStateLabels = {
  developerList: {
    title: 'Aucune tâche assignée',
    subtitle: 'Vos tâches assignées apparaîtront ici.',
  },
  leadList: {
    title: 'Aucune tâche disponible',
    subtitle: "Créez une tâche ou ajustez les filtres pour voir vos équipes.",
  },
  leadUnassigned: {
    title: "Aucune tâche en attente d'assignation",
    subtitle: 'Toutes les tâches de vos équipes sont déjà assignées.',
  },
  ctoList: {
    title: 'Aucune tâche dans cette organisation',
    subtitle: 'Aucune donnée à afficher pour le moment.',
  },
  poList: {
    title: "Aucune tâche d'équipe",
    subtitle: "Aucune tâche assignée à votre équipe n'est visible.",
  },
  comments: {
    title: 'Aucun commentaire',
    subtitle: 'Aucun commentaire à afficher pour cette tâche.',
  },
  histories: {
    title: 'Aucun historique',
    subtitle: "Aucun changement de statut n'a encore été enregistré.",
  },
  links: {
    title: 'Aucune tâche liée',
    subtitle: 'Ajoutez un lien pour suivre les dépendances.',
  },
  tags: {
    title: 'Aucun tag',
    subtitle: 'Créez un tag pour améliorer le filtrage.',
  },
};
