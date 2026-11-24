import { ShopDistributionSummary, BusinessProfile } from '../types';

/**
 * WhatsApp Helper for Chocolate Distribution Operations
 * Formats polite, professional Indian kirana store communication
 */

export function cleanPhoneNumber(phone: string): string {
  // Remove spaces, hyphens, plus signs
  const digits = phone.replace(/[^0-9]/g, '');
  // Default to India country code 91 if 10-digit number
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export function openWhatsAppChat(phone: string, text: string): void {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Template 1: Delivery Confirmation Receipt
 */
export function generateDeliveryReceiptWhatsApp(
  summary: ShopDistributionSummary,
  business: BusinessProfile
): string {
  const shop = summary.shop;
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let message = `🍫 *${business.businessName}*\n`;
  message += `*DELIVERY CONFIRMATION RECEIPT*\n\n`;
  message += `Dear ${shop.ownerName || 'Sir/Madam'},\n`;
  message += `We have successfully delivered chocolate boxes to *${shop.name}* on ${today}.\n\n`;
  message += `📦 *Delivered Items:*\n`;

  summary.flavourDetails.forEach(f => {
    if (f.distributedBoxes > 0) {
      const check = f.isFlavourCompleted ? '✅' : '⏳';
      message += `${check} *${f.product.brandName} ${f.product.flavourName}*: ${f.distributedBoxes} / ${f.assignedBoxes} boxes\n`;
    }
  });

  message += `\n*Total Delivered:* ${summary.totalDistributedBoxes} boxes\n`;
  if (summary.totalRemainingBoxes > 0) {
    message += `*Remaining Pending:* ${summary.totalRemainingBoxes} boxes (Will be supplied shortly)\n`;
  } else {
    message += `🎉 *Status:* Monthly quota completed!\n`;
  }

  message += `\nThank you for your business!\n`;
  message += `Contact: ${business.phone} | ${business.ownerName}`;

  return message;
}

/**
 * Template 2: Monthly Distribution Notice
 */
export function generateMonthlyNoticeWhatsApp(
  summary: ShopDistributionSummary,
  business: BusinessProfile,
  deliveryDateStr?: string
): string {
  const shop = summary.shop;
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  let message = `🍫 *${business.businessName}*\n`;
  message += `*MONTHLY CHOCOLATE DISTRIBUTION NOTICE*\n\n`;
  message += `Hello ${shop.ownerName || 'Shop Owner'},\n`;
  message += `Our monthly chocolate distribution for *${monthName}* has commenced.\n\n`;
  message += `Your scheduled delivery for *${shop.name}*:\n`;
  message += `📅 *Date:* ${deliveryDateStr || 'Between 1st & 5th of this month'}\n`;
  message += `📦 *Assigned Quota:* ${summary.totalAssignedBoxes} boxes total\n\n`;
  message += `*Breakdown:*\n`;

  summary.flavourDetails.forEach(f => {
    message += `• ${f.product.brandName} ${f.product.flavourName} – ${f.assignedBoxes} boxes\n`;
  });

  message += `\nPlease keep cash / UPI payment and display rack space ready.\n\n`;
  message += `Regards,\n${business.ownerName}\n${business.phone}`;

  return message;
}

/**
 * Template 3: Payment Reminder
 */
export function generatePaymentReminderWhatsApp(
  shopName: string,
  ownerName: string,
  outstandingAmount: number,
  business: BusinessProfile
): string {
  let message = `🍫 *${business.businessName}*\n`;
  message += `*PAYMENT REMINDER*\n\n`;
  message += `Dear ${ownerName || 'Sir/Madam'} (${shopName}),\n`;
  message += `This is a gentle reminder regarding the outstanding balance for recent chocolate supplies:\n\n`;
  message += `💰 *Pending Balance:* ${business.currency}${outstandingAmount.toLocaleString('en-IN')}\n\n`;
  message += `Kindly settle this via Google Pay / PhonePe / Paytm to: *${business.phone}* or during our representative's next visit.\n\n`;
  message += `Thank you for your continued partnership!\n`;
  message += `– ${business.businessName}`;

  return message;
}
