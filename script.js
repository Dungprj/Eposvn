// Function to get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        invoiceNumber: params.get('invoiceNumber') || '#SALE00015',
        date: params.get('date') || '04-04-2025',
        customerName: params.get('customerName') || 'Walk-In Customer',
        invoiceFrom: params.get('invoiceFrom') || 'Abc',
        items: params.get('items')
            ? JSON.parse(params.get('items'))
            : [
                  {
                      name: 'Dao bào hai lưỡi kiwi KW217 14,5cm',
                      quantity: 1,
                      price: '120,000đ',
                      tax: '0%',
                      taxAmount: '0đ',
                      total: '120,000đ'
                  }
              ],
        total: params.get('total') || '120,000đ'
    };
}

// Function to get current URL with parameters
function getCurrentUrlWithParams() {
    return window.location.href;
}

// Function to generate QR code URL using QuickChart API
function generateQrCodeUrl(url) {
    const encodedUrl = encodeURIComponent(url);
    return `https://quickchart.io/qr?text=${encodedUrl}&size=100&margin=1`;
}

// Function to generate invoice URL from invoice object
function generateInvoiceUrl(invoiceData) {
    const defaultData = {
        invoiceNumber: '#SALE00015',
        date: '04-04-2025',
        customerName: 'Walk-In Customer',
        invoiceFrom: 'Abc',
        items: [
            {
                name: 'Dao bào hai lưỡi kiwi KW217 14,5cm',
                quantity: 1,
                price: '120,000đ',
                tax: '0%',
                taxAmount: '0đ',
                total: '120,000đ'
            }
        ],
        total: '120,000đ'
    };

    const data = { ...defaultData, ...invoiceData };
    const params = new URLSearchParams();

    params.set('invoiceNumber', data.invoiceNumber);
    params.set('date', data.date);
    params.set('customerName', data.customerName);
    params.set('invoiceFrom', data.invoiceFrom);
    params.set('items', JSON.stringify(data.items));
    params.set('total', data.total);

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?${params.toString()}`;
}

// Function to populate the invoice with data
function populateInvoice() {
    try {
        const params = getUrlParams();
        const currentUrl = getCurrentUrlWithParams();
        const qrCodeUrl = generateQrCodeUrl(currentUrl);

        document.getElementById('invoice-number').textContent =
            params.invoiceNumber;
        document.getElementById(
            'invoice-date'
        ).textContent = `Date of invoice: ${params.date}`;
        document.getElementById('qr-code').src = qrCodeUrl;

        document.getElementById('customer-name').textContent =
            params.customerName;
        document.getElementById('invoice-from').textContent =
            params.invoiceFrom;

        const tableBody = document.getElementById('items-table-body');
        tableBody.innerHTML = ''; // Clear existing rows
        params.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Items">${item.name}</td>
                <td data-label="Quantity">${item.quantity}</td>
                <td data-label="Price">${item.price}</td>
                <td data-label="Tax">${item.tax}</td>
                <td data-label="Tax Amount">${item.taxAmount}</td>
                <td data-label="Total">${item.total}</td>
            `;
            tableBody.appendChild(row);
        });

        document.getElementById('total-amount').textContent = params.total;
    } catch (error) {
        console.error('Error populating invoice:', error);
        alert('Có lỗi xảy ra khi tạo hóa đơn');
    }
}

// Function to download the invoice as PDF
function downloadPDF() {
    const invoiceElement = document.getElementById('invoice');

    // Use html2canvas to capture the invoice as an image
    html2canvas(invoiceElement, { scale: 2 })
        .then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 190; // A4 width in mm (210mm - 10mm margin on each side)
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 10; // Start 10mm from the top

            // Add the image to the PDF
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // If the content is taller than one page, add more pages
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            doc.save(`invoice-${getUrlParams().invoiceNumber}.pdf`);
        })
        .catch(error => {
            console.error('Error generating PDF:', error);
            alert('Có lỗi xảy ra khi tạo PDF');
        });
}

// Call the function when the page loads
window.onload = populateInvoice;
