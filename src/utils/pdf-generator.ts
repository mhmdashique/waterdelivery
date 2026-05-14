import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order: any) => {
  const doc = new jsPDF();
  
  // Define Premium Palette
  type RGB = [number, number, number];
  const colors: Record<string, RGB> = {
    midnight: [15, 23, 42],    // Slate 900
    royal: [67, 56, 202],      // Indigo 700
    ocean: [14, 165, 233],     // Sky 500
    silver: [241, 245, 249],   // Slate 100
    smoke: [100, 116, 139],    // Slate 500
    success: [5, 150, 105],    // Emerald 700
    danger: [185, 28, 28]      // Red 700
  };

  // ─── SOPHISTICATED HEADER ───
  // Primary Gradient-like Header
  doc.setFillColor(colors.royal[0], colors.royal[1], colors.royal[2]);
  doc.rect(0, 0, 210, 25, "F");
  
  // Accent Strip
  doc.setFillColor(colors.ocean[0], colors.ocean[1], colors.ocean[2]);
  doc.rect(0, 25, 210, 2, "F");

  // Verified Badge (Background Watermark Effect)
  doc.setTextColor(248, 250, 252);
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  doc.text("ORIGINAL", 105, 150, { align: "center", angle: 45 });

  // ─── COMPANY BRANDING ───
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("AS AGENCIES | PREMIUM HYDRATION", 20, 15);

  doc.setTextColor(colors.midnight[0], colors.midnight[1], colors.midnight[2]);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("AS AGENCIES", 20, 50);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.smoke[0], colors.smoke[1], colors.smoke[2]);
  doc.text("98, Aqua Tower, Industrial Estate Phase II", 20, 58);
  doc.text("Kochi, Kerala - 682001 | contact@asagencies.com", 20, 63);

  // ─── INVOICE SUMMARY BOX ───
  doc.setFillColor(colors.silver[0], colors.silver[1], colors.silver[2]);
  doc.roundedRect(140, 40, 55, 30, 2, 2, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.royal[0], colors.royal[1], colors.royal[2]);
  doc.text("INVOICE", 145, 50);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.midnight[0], colors.midnight[1], colors.midnight[2]);
  doc.text(`REF: #${order.id.slice(-8).toUpperCase()}`, 145, 58);
  doc.setFont("helvetica", "normal");
  doc.text(`DATE: ${new Date(order.createdAt).toLocaleDateString()}`, 145, 63);

  // ─── BILLING & SHIPPING ───
  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 80, 190, 80);

  // Bill To
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.royal[0], colors.royal[1], colors.royal[2]);
  doc.text("BILL TO", 20, 90);
  
  doc.setFontSize(12);
  doc.setTextColor(colors.midnight[0], colors.midnight[1], colors.midnight[2]);
  doc.text(order.userName || "Valued Client", 20, 98);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.smoke[0], colors.smoke[1], colors.smoke[2]);
  doc.text(order.phone || "N/A", 20, 104);
  const addr = doc.splitTextToSize(order.address || "Direct Collection", 70);
  doc.text(addr, 20, 109);

  // Shipment Details
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.royal[0], colors.royal[1], colors.royal[2]);
  doc.text("SHIPMENT DETAILS", 110, 90);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.midnight[0], colors.midnight[1], colors.midnight[2]);
  doc.text(`Order Status: ${order.status}`, 110, 98);
  doc.text(`Landmark: ${order.landmark || "None"}`, 110, 104);
  doc.text(`Method: ${order.paymentMethod || "COD"}`, 110, 109);

  // ─── LINE ITEMS TABLE ───
  const tableData = (order.items || []).map((item: any) => [
    item.name,
    item.quantity,
    `Rs. ${item.price.toFixed(2)}`,
    `Rs. ${(item.price * item.quantity).toFixed(2)}`
  ]);

  if (tableData.length === 0) {
    tableData.push(["20L Water Can", order.cans || 1, "Rs. 60.00", `Rs. ${order.total.toFixed(2)}`]);
  }

  autoTable(doc, {
    startY: 125,
    head: [["Item Description", "Qty", "Unit Price", "Subtotal"]],
    body: tableData,
    headStyles: { 
      fillColor: colors.midnight, 
      textColor: [255, 255, 255], 
      fontSize: 9,
      fontStyle: "bold",
      halign: "center",
      cellPadding: 4
    },
    bodyStyles: { 
      fontSize: 9, 
      textColor: colors.midnight,
      cellPadding: 4
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 80 },
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" }
    },
    alternateRowStyles: { fillColor: [252, 253, 255] },
    margin: { left: 20, right: 20 },
  });

  // ─── TOTALS SECTION ───
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Words Conversion
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(colors.smoke[0], colors.smoke[1], colors.smoke[2]);
  doc.text(`Amount in Words: Rupee(s) ${order.total.toLocaleString()} Only`, 20, finalY + 5);

  // Payment Status Stamp
  const statusCol = order.paymentStatus === 'Paid' ? colors.success : colors.danger;
  doc.setDrawColor(statusCol[0], statusCol[1], statusCol[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(20, finalY + 12, 45, 15, 1, 1, "D");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(statusCol[0], statusCol[1], statusCol[2]);
  doc.text(order.paymentStatus.toUpperCase(), 42.5, finalY + 22, { align: "center" });

  // Calculation Block
  doc.setFillColor(colors.silver[0], colors.silver[1], colors.silver[2]);
  doc.rect(130, finalY, 65, 35, "F");
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.midnight[0], colors.midnight[1], colors.midnight[2]);
  doc.text("Subtotal", 135, finalY + 10);
  doc.text(`Rs. ${order.total.toFixed(2)}`, 190, finalY + 10, { align: "right" });
  
  doc.text("Tax (0%)", 135, finalY + 18);
  doc.text("Rs. 0.00", 190, finalY + 18, { align: "right" });
  
  doc.setDrawColor(colors.royal[0], colors.royal[1], colors.royal[2]);
  doc.setLineWidth(0.5);
  doc.line(135, finalY + 23, 190, finalY + 23);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.royal[0], colors.royal[1], colors.royal[2]);
  doc.text("TOTAL AMOUNT", 135, finalY + 30);
  doc.text(`Rs. ${order.total.toFixed(2)}`, 190, finalY + 30, { align: "right" });

  // ─── FINAL FOOTER ───
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(colors.silver[0], colors.silver[1], colors.silver[2]);
  doc.line(20, pageHeight - 30, 190, pageHeight - 30);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.smoke[0], colors.smoke[1], colors.smoke[2]);
  doc.text("Thank you for choosing AS Agencies. We appreciate your continued trust.", 105, pageHeight - 20, { align: "center" });
  doc.text("This is an electronically generated document. No physical signature is required.", 105, pageHeight - 15, { align: "center" });
  doc.text("Visit us at: www.asagencies.com", 105, pageHeight - 10, { align: "center" });

  doc.save(`AS_INVOICE_${order.id.slice(-8).toUpperCase()}.pdf`);
};

export const exportAllOrders = (orders: any[]) => {
  const doc = new jsPDF("l", "mm", "a4");

  // Premium Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 25, "F");
  doc.setFillColor(14, 165, 233);
  doc.rect(0, 25, 297, 2, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AS AGENCIES - SALES RECONCILIATION REPORT", 15, 17);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, 240, 17);

  const tableData = orders.map((o) => {
    const itemsStr = o.items ? o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ") : `${o.cans || 0}x Water Can`;
    return [
      o.id.slice(-8).toUpperCase(),
      new Date(o.createdAt).toLocaleDateString(),
      o.userName,
      o.phone,
      itemsStr,
      `Rs. ${o.total.toFixed(2)}`,
      o.status,
      o.paymentStatus
    ];
  });

  autoTable(doc, {
    startY: 35,
    head: [["ID", "Date", "Customer", "Phone", "Items", "Total", "Status", "Payment"]],
    body: tableData,
    headStyles: { fillColor: [15, 23, 42] as [number, number, number], textColor: [255, 255, 255] as [number, number, number], fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30 },
      4: { cellWidth: 85 },
      5: { cellWidth: 25, halign: "right" },
      6: { cellWidth: 25, halign: "center" },
      7: { cellWidth: 25, halign: "center" }
    },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 252] as [number, number, number] },
    margin: { left: 15, right: 15 }
  });

  doc.save(`SALES_SUMMARY_${new Date().getTime()}.pdf`);
};
