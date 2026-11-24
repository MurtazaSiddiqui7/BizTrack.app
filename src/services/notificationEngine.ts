import { storage } from './storage';
import { NotificationItem, MonthlyPlan } from '../types';

/**
 * Smart Notification & Reminder Engine
 * 
 * Rules:
 * - 1st: Distribution cycle starts! Alert owner of all shops pending.
 * - 2nd: Follow-up reminder for shops not yet started.
 * - 3rd: Highlight pending and partially completed shops.
 * - 4th: Urgent reminder for incomplete shops.
 * - 5th: Final day reminder! Urgent distribution deadline.
 * - After 5th: Overdue warning for any shops with remaining boxes.
 * - Low stock alert when any chocolate inventory falls below threshold.
 * - Automatically stops reminders for a shop once all its assigned flavours are distributed.
 */
export class NotificationEngine {
  public static checkAndGenerateAlerts(plan: MonthlyPlan): NotificationItem[] {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Check if this plan matches the current calendar period
    const isCurrentCalendarMonth = plan.month === currentMonth && plan.year === currentYear;
    const profile = storage.getProfile();
    const summaries = storage.getAllShopDistributionSummaries(plan.id);

    const pendingShops = summaries.filter(s => s.status === 'pending');
    const partialShops = summaries.filter(s => s.status === 'partial');
    const incompleteCount = pendingShops.length + partialShops.length;

    const generatedAlerts: NotificationItem[] = [];

    if (isCurrentCalendarMonth) {
      if (currentDay === 1 && incompleteCount > 0) {
        generatedAlerts.push({
          id: `cycle-start-${plan.id}`,
          type: 'cycle_start',
          title: 'Monthly Distribution Cycle Commenced',
          message: `Distribution cycle started for ${today.toLocaleString('default', { month: 'long' })}. ${incompleteCount} shops scheduled for delivery between 1st and 5th.`,
          priority: 'high',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (currentDay === 2 && incompleteCount > 0) {
        generatedAlerts.push({
          id: `day2-reminder-${plan.id}`,
          type: 'daily_reminder',
          title: 'Day 2 Distribution Reminder',
          message: `${pendingShops.length} shops have not been visited yet. Plan your delivery route today.`,
          priority: 'medium',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (currentDay === 3 && incompleteCount > 0) {
        generatedAlerts.push({
          id: `day3-reminder-${plan.id}`,
          type: 'daily_reminder',
          title: 'Day 3 Mid-Cycle Status',
          message: `${partialShops.length} shops partially completed and ${pendingShops.length} pending. Prioritize remaining flavours today.`,
          priority: 'high',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (currentDay === 4 && incompleteCount > 0) {
        generatedAlerts.push({
          id: `day4-urgent-${plan.id}`,
          type: 'urgent_reminder',
          title: '⚠️ Urgent: 1 Day Left for Monthly Distribution Window',
          message: `Distribution window ends tomorrow! ${incompleteCount} shops still have undelivered boxes.`,
          priority: 'urgent',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (currentDay === 5 && incompleteCount > 0) {
        generatedAlerts.push({
          id: `day5-final-${plan.id}`,
          type: 'urgent_reminder',
          title: '🚨 Final Day Distribution Alert!',
          message: `Today is the 5th of the month. Complete remaining deliveries for ${incompleteCount} shops before end of day.`,
          priority: 'urgent',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (currentDay > 5 && incompleteCount > 0) {
        generatedAlerts.push({
          id: `overdue-${plan.id}-${currentDay}`,
          type: 'overdue',
          title: `🔴 Overdue Distribution (${incompleteCount} Shops Pending)`,
          message: `The normal 1st-5th window has passed. ${incompleteCount} shops remain incomplete with ${summaries.reduce((acc, s) => acc + s.totalRemainingBoxes, 0)} boxes pending delivery.`,
          priority: 'urgent',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Check low stock chocolate flavours
    const inventory = storage.getInventory();
    const products = storage.getProducts();

    inventory.forEach(inv => {
      if (inv.availableBoxes <= inv.lowStockThreshold) {
        const prod = products.find(p => p.id === inv.productId);
        if (prod && !prod.isDiscontinued) {
          generatedAlerts.push({
            id: `lowstock-${prod.id}`,
            type: 'low_stock',
            title: `Low Stock Alert: ${prod.brandName} ${prod.flavourName}`,
            message: `Only ${inv.availableBoxes} boxes available (threshold: ${inv.lowStockThreshold}). Restock needed before fulfilling pending shop orders.`,
            priority: inv.availableBoxes === 0 ? 'urgent' : 'high',
            productId: prod.id,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    return generatedAlerts;
  }

  // Request browser web push notification permission
  public static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Send a real browser push notification if permitted
  public static sendPushNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/logo.svg',
          badge: '/logo.svg',
          ...options
        });
      } catch (e) {
        console.warn('Could not display native notification:', e);
      }
    }
  }
}
