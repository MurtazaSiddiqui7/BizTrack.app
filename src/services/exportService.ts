import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  ShopDistributionSummary,
  MonthDistributionStats,
  MonthlyPlan,
  BusinessProfile,
  ChocolateProduct,
  ProductInventory
} from '../types';

/**
 * Export Service for PDF and Excel Reports
 */

export class ExportService {
  /**
   * PDF: Complete Monthly Distribution Report
   */
  public static exportMonthlyDistributionPDF(params: {
    plan: MonthlyPlan;
    profile: BusinessProfile;
    summaries: ShopDistributionSummary[];
    stats: MonthDistributionStats;
  }): void {
    const { plan, profile, summaries, stats } = params;
    const doc = new jsPDF('p', 'mm', 'a4');
    const monthName = new Date(plan.year, plan.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    // Header styling
    doc.setFillColor(6, 78, 59); // Emerald 900
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('BIZTRACK – DISTRIBUTION REPORT', 14, 14);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${profile.businessName} | Owner: ${profile.ownerName} | Ph: ${profile.phone}`, 14, 22);
    doc.text(`Period: ${monthName} (Cycle: 1st - 5th)`, 14, 28);

    // Summary Box
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Monthly Distribution Summary', 14, 40);

    const summaryCards = [
      [`Total Shops: ${stats.totalShops}`, `Completed: ${stats.completedShops} (${stats.shopCompletionPercentage}%)`],
      [`Assigned Boxes: ${stats.totalAssignedBoxes}`, `Distributed: ${stats.totalDistributedBoxes} (${stats.boxCompletionPercentage}%)`],
      [`Partial Shops: ${stats.partialShops}`, `Pending Boxes: ${stats.totalRemainingBoxes}`]
    ];

    autoTable(doc, {
      startY: 43,
      body: summaryCards,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, textColor: [30, 41, 59] },
      headStyles: { fillColor: [240, 253, 244] }
    });

    // Shop Table
    const tableData = summaries.map(s => [
      s.shop.name,
      s.shop.locality,
      s.shop.phone,
      s.totalAssignedBoxes.toString(),
      s.totalDistributedBoxes.toString(),
      s.totalRemainingBoxes.toString(),
      s.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8,
      head: [['Shop Name', 'Locality', 'Mobile', 'Assigned', 'Distributed', 'Pending', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [4, 120, 87], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const val = data.cell.raw;
          if (val === 'COMPLETED') {
            data.cell.styles.textColor = [16, 185, 129];
          } else if (val === 'PARTIAL') {
            data.cell.styles.textColor = [245, 158, 11];
          } else {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-IN')} | Page ${i} of ${pageCount} | BizTrack Distribution System`,
        14,
        290
      );
    }

    doc.save(`BizTrack-Distribution-${plan.year}-${plan.month}.pdf`);
  }

  /**
   * PDF: Individual Shop Delivery Slip / Invoice
   */
  public static exportShopDeliverySlipPDF(params: {
    summary: ShopDistributionSummary;
    profile: BusinessProfile;
    plan: MonthlyPlan;
  }): void {
    const { summary, profile, plan } = params;
    const doc = new jsPDF('p', 'mm', 'a5'); // A5 size receipt

    const shop = summary.shop;
    const monthName = new Date(plan.year, plan.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    // Emerald Header
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 148, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(profile.businessName, 10, 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Owner: ${profile.ownerName} | Ph: ${profile.phone} | ${profile.city}`, 10, 16);
    doc.text(`DISTRIBUTION DELIVERY SLIP – ${monthName.toUpperCase()}`, 10, 21);

    // Customer / Shop Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Delivered To: ${shop.name}`, 10, 32);
    doc.setFont('helvetica', 'normal');
    doc.text(`Proprietor: ${shop.ownerName} | Ph: ${shop.phone}`, 10, 37);
    doc.text(`Address: ${shop.address}, ${shop.locality}`, 10, 42);
    doc.text(`Delivery Date: ${new Date().toLocaleDateString('en-IN')}`, 10, 47);

    // Items Table
    const rows = summary.flavourDetails.map(f => [
      `${f.product.brandName} ${f.product.flavourName}`,
      f.assignedBoxes.toString(),
      f.distributedBoxes.toString(),
      f.remainingBoxes.toString(),
      f.isFlavourCompleted ? 'Done' : 'Pending'
    ]);

    autoTable(doc, {
      startY: 52,
      head: [['Flavour / Item', 'Assigned', 'Delivered', 'Balance', 'Status']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [4, 120, 87], textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Boxes Delivered: ${summary.totalDistributedBoxes} / ${summary.totalAssignedBoxes}`, 10, finalY);

    if (summary.totalRemainingBoxes > 0) {
      doc.setTextColor(239, 68, 68);
      doc.text(`Remaining Pending: ${summary.totalRemainingBoxes} boxes`, 10, finalY + 5);
    } else {
      doc.setTextColor(16, 185, 129);
      doc.text(`Status: All Assigned Flavours Successfully Completed!`, 10, finalY + 5);
    }

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Receiver Signature: __________________', 80, finalY + 22);

    doc.save(`DeliverySlip-${shop.name.replace(/\s+/g, '_')}-${plan.year}-${plan.month}.pdf`);
  }

  /**
   * Excel: Export Complete Monthly Distribution Details
   */
  public static exportMonthlyDistributionExcel(params: {
    plan: MonthlyPlan;
    summaries: ShopDistributionSummary[];
  }): void {
    const { plan, summaries } = params;

    const data = summaries.map((s, idx) => ({
      'S.No': idx + 1,
      'Shop Name': s.shop.name,
      'Owner Name': s.shop.ownerName,
      'Mobile': s.shop.phone,
      'Locality': s.shop.locality,
      'City': s.shop.city,
      'Total Assigned (Boxes)': s.totalAssignedBoxes,
      'Total Delivered (Boxes)': s.totalDistributedBoxes,
      'Remaining Pending (Boxes)': s.totalRemainingBoxes,
      'Completion %': s.totalAssignedBoxes > 0 ? Math.round((s.totalDistributedBoxes / s.totalAssignedBoxes) * 100) : 0,
      'Distribution Status': s.status.toUpperCase(),
      'Flavour Breakdown': s.flavourDetails
        .map(f => `${f.product.brandName} ${f.product.flavourName}: ${f.distributedBoxes}/${f.assignedBoxes}`)
        .join('; ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Distribution Details');

    // Auto-fit column widths
    const max_width = 30;
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
      { wch: 50 }
    ];

    XLSX.writeFile(workbook, `BizTrack-Distribution-${plan.year}-${plan.month}.xlsx`);
  }

  /**
   * Excel: Export Current Inventory Records
   */
  public static exportInventoryExcel(products: ChocolateProduct[], inventory: ProductInventory[]): void {
    const data = products.map((p, idx) => {
      const inv = inventory.find(i => i.productId === p.id);
      const stock = inv ? inv.availableBoxes : 0;
      const threshold = inv ? inv.lowStockThreshold : 20;
      return {
        'S.No': idx + 1,
        'Brand': p.brandName,
        'Flavour / Product': p.flavourName,
        'Product Code': p.internalCode || 'N/A',
        'Available Stock (Boxes)': stock,
        'Low Stock Threshold': threshold,
        'Stock Status': stock <= 0 ? 'OUT OF STOCK' : stock <= threshold ? 'LOW STOCK' : 'HEALTHY',
        'Unit Cost (₹)': p.unitCost,
        'Unit Price (₹)': p.unitPrice,
        'Inventory Value (₹)': stock * p.unitCost,
        'Packaging Description': p.boxDescription
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Warehouse Stock');
    XLSX.writeFile(wb, `BizTrack-Inventory-${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}
