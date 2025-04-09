// Lấy tham số từ URL
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

// Tạo URL từ dữ liệu invoice
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

// Tạo URL QR code từ QuickChart API
function generateQrCodeUrl(url) {
    const encodedUrl = encodeURIComponent(url);
    return `https://quickchart.io/qr?text=${encodedUrl}&size=150&margin=1`; // Tăng size lên 150 cho QR rõ hơn
}

// Điền dữ liệu vào hóa đơn
function populateInvoice() {
    try {
        const params = getUrlParams();
        const invoiceUrl = generateInvoiceUrl(params); // Tạo URL từ dữ liệu hiện tại
        const qrCodeUrl = generateQrCodeUrl(invoiceUrl); // Tạo QR code từ URL

        // Điền thông tin hóa đơn
        document.getElementById('invoice-number').textContent =
            params.invoiceNumber;
        document.getElementById(
            'invoice-date'
        ).textContent = `Date of invoice: ${params.date}`;
        document.getElementById('customer-name').textContent =
            params.customerName;
        document.getElementById('invoice-from').textContent =
            params.invoiceFrom;
        document.getElementById('total-amount').textContent = params.total;

        // Điền bảng items
        const tableBody = document.getElementById('items-table-body');
        tableBody.innerHTML = '';
        params.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td>${item.tax}</td>
                <td>${item.taxAmount}</td>
                <td>${item.total}</td>
            `;
            tableBody.appendChild(row);
        });

        // Cập nhật QR code
        const qrCodeImg = document.getElementById('qr-code');
        qrCodeImg.src = qrCodeUrl;
        qrCodeImg.onerror = () => {
            console.error('Không tải được QR code:', qrCodeUrl);
            qrCodeImg.src = 'https://via.placeholder.com/150?text=QR+Error';
        };
        qrCodeImg.onload = () => {
            console.log('QR code tải thành công:', qrCodeUrl);
        };

        // Debug: In URL để kiểm tra
        console.log('Invoice URL:', invoiceUrl);
        console.log('QR Code URL:', qrCodeUrl);
    } catch (error) {
        console.error('Lỗi khi tạo hóa đơn:', error);
        alert('Có lỗi xảy ra khi tạo hóa đơn');
    }
}

// Tải hóa đơn dưới dạng PDF
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const invoiceElement = document.getElementById('invoice');

    doc.html(invoiceElement, {
        callback: function (doc) {
            doc.save(`invoice-${getUrlParams().invoiceNumber}.pdf`);
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800
    });
}

// Test với dữ liệu tùy chỉnh
function testInvoice() {
    const testData = {
        invoiceNumber: '#SALE00016',
        date: '05-04-2025',
        customerName: 'John Doe',
        invoiceFrom: 'XYZ Corp',
        items: [
            {
                name: 'Bút chì cao cấp',
                quantity: 2,
                price: '50,000đ',
                tax: '10%',
                taxAmount: '10,000đ',
                total: '110,000đ'
            }
        ],
        total: '110,000đ'
    };

    const testUrl = generateInvoiceUrl(testData);
    const qrCodeUrl = generateQrCodeUrl(testUrl);
    console.log('Test Invoice URL:', testUrl);
    console.log('Test QR Code URL:', qrCodeUrl);

    // Hiển thị QR code test (bỏ comment nếu muốn)
    // document.getElementById('qr-code').src = qrCodeUrl;
}

// Gọi hàm khi trang tải
window.onload = populateInvoice;

// Gọi testInvoice() trong console nếu cần
// testInvoice();
