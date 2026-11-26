import User from './user.model.js';
import Session from './session.model.js';
import UserPreference from './userPreference.model.js';
import Workspace from './workspace.model.js';
import Household from './household.model.js';
import HouseholdMember from './householdMember.model.js';
import HouseholdInvitation from './householdInvitation.model.js';
import Ingredient from './ingredient.model.js';
import IngredientAlias from './ingredientAlias.model.js';
import PantryItem from './pantryItem.model.js';
import PantryBatch from './pantryBatch.model.js';
import MonthlyPlan from './monthlyPlan.model.js';
import MonthlyPlanItem from './monthlyPlanItem.model.js';
import ShoppingItem from './shoppingItem.model.js';
import RecipeMetadata from './recipeMetadata.model.js';
import Alert from './alert.model.js';
import NotificationHistory from './notificationHistory.model.js';

Workspace.belongsTo(User, {
    as: 'creator',
    foreignKey: 'createdByUserId',
    constraints: false
});

User.hasMany(Workspace, {
    as: 'createdWorkspaces',
    foreignKey: 'createdByUserId',
    constraints: false
});

Household.belongsTo(Workspace, {
    as: 'workspace',
    foreignKey: 'workspaceId',
    constraints: false
});

Workspace.hasOne(Household, {
    as: 'household',
    foreignKey: 'workspaceId',
    constraints: false
});

HouseholdMember.belongsTo(Household, {
    as: 'household',
    foreignKey: 'householdId',
    constraints: false
});

Household.hasMany(HouseholdMember, {
    as: 'members',
    foreignKey: 'householdId',
    constraints: false
});

HouseholdMember.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
    constraints: false
});

User.hasOne(HouseholdMember, {
    as: 'householdMembership',
    foreignKey: 'userId',
    constraints: false
});

HouseholdInvitation.belongsTo(Household, {
    as: 'household',
    foreignKey: 'householdId',
    constraints: false
});

Household.hasMany(HouseholdInvitation, {
    as: 'invitations',
    foreignKey: 'householdId',
    constraints: false
});

HouseholdInvitation.belongsTo(User, {
    as: 'inviter',
    foreignKey: 'inviterUserId',
    constraints: false
});

User.hasMany(HouseholdInvitation, {
    as: 'sentInvitations',
    foreignKey: 'inviterUserId',
    constraints: false
});

HouseholdInvitation.belongsTo(User, {
    as: 'invitee',
    foreignKey: 'inviteeUserId',
    constraints: false
});

User.hasMany(HouseholdInvitation, {
    as: 'receivedInvitations',
    foreignKey: 'inviteeUserId',
    constraints: false
});

Session.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
    constraints: false
});

User.hasMany(Session, {
    as: 'sessions',
    foreignKey: 'userId',
    constraints: false
});

UserPreference.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
    constraints: false
});

User.hasOne(UserPreference, {
    as: 'preferences',
    foreignKey: 'userId',
    constraints: false
});

IngredientAlias.belongsTo(Ingredient, {
    as: 'ingredient',
    foreignKey: 'ingredientId',
    constraints: false
});

Ingredient.hasMany(IngredientAlias, {
    as: 'aliases',
    foreignKey: 'ingredientId',
    constraints: false
});

PantryItem.belongsTo(Workspace, {
    as: 'workspace',
    foreignKey: 'workspaceId',
    constraints: false
});

Workspace.hasMany(PantryItem, {
    as: 'pantryItems',
    foreignKey: 'workspaceId',
    constraints: false
});

PantryItem.belongsTo(Ingredient, {
    as: 'ingredient',
    foreignKey: 'ingredientId',
    constraints: false
});

Ingredient.hasMany(PantryItem, {
    as: 'pantryItems',
    foreignKey: 'ingredientId',
    constraints: false
});

PantryItem.belongsTo(User, {
    as: 'creator',
    foreignKey: 'createdBy',
    constraints: false
});

User.hasMany(PantryItem, {
    as: 'createdPantryItems',
    foreignKey: 'createdBy',
    constraints: false
});

PantryBatch.belongsTo(PantryItem, {
    as: 'pantryItem',
    foreignKey: 'pantryItemId',
    constraints: false
});

PantryItem.hasMany(PantryBatch, {
    as: 'batches',
    foreignKey: 'pantryItemId',
    constraints: false
});

PantryBatch.belongsTo(User, {
    as: 'creator',
    foreignKey: 'createdBy',
    constraints: false
});

User.hasMany(PantryBatch, {
    as: 'createdPantryBatches',
    foreignKey: 'createdBy',
    constraints: false
});

MonthlyPlan.belongsTo(Workspace, {
    as: 'workspace',
    foreignKey: 'workspaceId',
    constraints: false
});

Workspace.hasMany(MonthlyPlan, {
    as: 'monthlyPlans',
    foreignKey: 'workspaceId',
    constraints: false
});

MonthlyPlan.belongsTo(User, {
    as: 'creator',
    foreignKey: 'createdBy',
    constraints: false
});

User.hasMany(MonthlyPlan, {
    as: 'createdMonthlyPlans',
    foreignKey: 'createdBy',
    constraints: false
});

MonthlyPlanItem.belongsTo(MonthlyPlan, {
    as: 'monthlyPlan',
    foreignKey: 'monthlyPlanId',
    constraints: false
});

MonthlyPlan.hasMany(MonthlyPlanItem, {
    as: 'items',
    foreignKey: 'monthlyPlanId',
    constraints: false
});

MonthlyPlanItem.belongsTo(Ingredient, {
    as: 'ingredient',
    foreignKey: 'ingredientId',
    constraints: false
});

Ingredient.hasMany(MonthlyPlanItem, {
    as: 'monthlyPlanItems',
    foreignKey: 'ingredientId',
    constraints: false
});

MonthlyPlanItem.belongsTo(User, {
    as: 'contributor',
    foreignKey: 'addedBy',
    constraints: false
});

User.hasMany(MonthlyPlanItem, {
    as: 'addedMonthlyPlanItems',
    foreignKey: 'addedBy',
    constraints: false
});

MonthlyPlanItem.belongsTo(User, {
    as: 'closureBuyer',
    foreignKey: 'buyerAtClosure',
    constraints: false
});

User.hasMany(MonthlyPlanItem, {
    as: 'monthlyItemsAsClosureBuyer',
    foreignKey: 'buyerAtClosure',
    constraints: false
});

ShoppingItem.belongsTo(Workspace, {
    as: 'workspace',
    foreignKey: 'workspaceId',
    constraints: false
});

Workspace.hasMany(ShoppingItem, {
    as: 'shoppingItems',
    foreignKey: 'workspaceId',
    constraints: false
});

ShoppingItem.belongsTo(MonthlyPlanItem, {
    as: 'monthlyPlanItem',
    foreignKey: 'monthlyPlanItemId',
    constraints: false
});

MonthlyPlanItem.hasOne(ShoppingItem, {
    as: 'shoppingItem',
    foreignKey: 'monthlyPlanItemId',
    constraints: false
});

ShoppingItem.belongsTo(Ingredient, {
    as: 'ingredient',
    foreignKey: 'ingredientId',
    constraints: false
});

Ingredient.hasMany(ShoppingItem, {
    as: 'shoppingItems',
    foreignKey: 'ingredientId',
    constraints: false
});

ShoppingItem.belongsTo(PantryItem, {
    as: 'sourcePantryItem',
    foreignKey: 'sourcePantryItemId',
    constraints: false
});

PantryItem.hasMany(ShoppingItem, {
    as: 'sourceShoppingItems',
    foreignKey: 'sourcePantryItemId',
    constraints: false
});

ShoppingItem.belongsTo(PantryItem, {
    as: 'restockedPantryItem',
    foreignKey: 'restockedPantryItemId',
    constraints: false
});

PantryItem.hasMany(ShoppingItem, {
    as: 'restockedShoppingItems',
    foreignKey: 'restockedPantryItemId',
    constraints: false
});

ShoppingItem.belongsTo(User, {
    as: 'contributor',
    foreignKey: 'addedBy',
    constraints: false
});

User.hasMany(ShoppingItem, {
    as: 'addedShoppingItems',
    foreignKey: 'addedBy',
    constraints: false
});

ShoppingItem.belongsTo(User, {
    as: 'buyer',
    foreignKey: 'assignedTo',
    constraints: false
});

User.hasMany(ShoppingItem, {
    as: 'assignedShoppingItems',
    foreignKey: 'assignedTo',
    constraints: false
});

Alert.belongsTo(Workspace, {
    as: 'workspace',
    foreignKey: 'workspaceId',
    constraints: false
});

Workspace.hasMany(Alert, {
    as: 'alerts',
    foreignKey: 'workspaceId',
    constraints: false
});

Alert.belongsTo(PantryItem, {
    as: 'pantryItem',
    foreignKey: 'pantryItemId',
    constraints: false
});

PantryItem.hasMany(Alert, {
    as: 'alerts',
    foreignKey: 'pantryItemId',
    constraints: false
});

Alert.belongsTo(PantryBatch, {
    as: 'pantryBatch',
    foreignKey: 'pantryBatchId',
    constraints: false
});

PantryBatch.hasMany(Alert, {
    as: 'alerts',
    foreignKey: 'pantryBatchId',
    constraints: false
});

NotificationHistory.belongsTo(Alert, {
    as: 'alert',
    foreignKey: 'alertId',
    constraints: false
});

Alert.hasMany(NotificationHistory, {
    as: 'notifications',
    foreignKey: 'alertId',
    constraints: false
});

NotificationHistory.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
    constraints: false
});

User.hasMany(NotificationHistory, {
    as: 'notifications',
    foreignKey: 'userId',
    constraints: false
});

export {
    User,
    Session,
    UserPreference,
    Workspace,
    Household,
    HouseholdMember,
    HouseholdInvitation,
    Ingredient,
    IngredientAlias,
    PantryItem,
    PantryBatch,
    MonthlyPlan,
    MonthlyPlanItem,
    ShoppingItem,
    RecipeMetadata,
    Alert,
    NotificationHistory
};
