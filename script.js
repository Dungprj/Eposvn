// Lấy tham số từ URL
// Lấy tham số từ URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('data');

    if (encodedData) {
        try {
            const decodedData = decodeURIComponent(atob(encodedData));
            const parsedData = JSON.parse(decodedData);

            // Kiểm tra từng trường bắt buộc
            const requiredFields = [
                'invoiceNumber',
                'date',
                'customerName',
                'invoiceFrom',
                'items',
                'total'
            ];

            // Kiểm tra xem tất cả các trường có tồn tại và không undefined/null
            for (const field of requiredFields) {
                if (
                    !parsedData[field] ||
                    parsedData[field] === null ||
                    parsedData[field] === undefined
                ) {
                    console.error(
                        `Lỗi: Trường ${field} không tồn tại hoặc không hợp lệ`
                    );
                    window.location.href = 'page404.html'; // Điều hướng sang page404
                    return; // Thoát hàm ngay lập tức
                }
            }

            // Kiểm tra mảng items có ít nhất 1 phần tử và các trường con
            if (
                !Array.isArray(parsedData.items) ||
                parsedData.items.length === 0
            ) {
                console.error('Lỗi: Mảng items không hợp lệ hoặc rỗng');
                window.location.href = 'page404.html';
                return;
            }

            // Kiểm tra các trường trong từng item
            const itemRequiredFields = [
                'name',
                'quantity',
                'price',
                'tax',
                'taxAmount',
                'total'
            ];
            for (const item of parsedData.items) {
                for (const field of itemRequiredFields) {
                    if (
                        !item[field] ||
                        item[field] === null ||
                        item[field] === undefined
                    ) {
                        console.error(
                            `Lỗi: Trường ${field} trong item không tồn tại hoặc không hợp lệ`
                        );
                        window.location.href = 'page404.html';
                        return;
                    }
                }
            }

            // Nếu tất cả kiểm tra đều qua, trả về dữ liệu
            return {
                invoiceNumber: parsedData.invoiceNumber,
                date: parsedData.date,
                customerName: parsedData.customerName,
                invoiceFrom: parsedData.invoiceFrom,
                items: parsedData.items,
                total: parsedData.total
            };
        } catch (e) {
            console.error('Lỗi giải mã dữ liệu:', e);
            window.location.href = 'page404.html'; // Điều hướng nếu có lỗi giải mã
            return;
        }
    }

    // Giá trị mặc định nếu không có tham số data
    return {
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
}

// Tạo URL từ dữ liệu invoice với base64
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
    const jsonString = JSON.stringify(data);
    const safeString = encodeURIComponent(jsonString); // Xử lý ký tự Unicode
    const encodedData = btoa(safeString);

    const params = new URLSearchParams();
    params.set('data', encodedData);

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?${params.toString()}`;
}

// Tạo URL QR code từ QuickChart API
function generateQrCodeUrl(url) {
    const encodedUrl = encodeURIComponent(url);
    return `https://quickchart.io/qr?text=${encodedUrl}&size=150&margin=1`;
}

// Điền dữ liệu vào hóa đơn
function populateInvoice() {
    try {
        const params = getUrlParams();
        const invoiceUrl = generateInvoiceUrl(params);
        const qrCodeUrl = generateQrCodeUrl(invoiceUrl);

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

        const qrCodeImg = document.getElementById('qr-code');
        qrCodeImg.src = qrCodeUrl;
        qrCodeImg.onerror = () => {
            console.error('Không tải được QR code:', qrCodeUrl);
            qrCodeImg.src = 'https://via.placeholder.com/150?text=QR+Error';
        };
        qrCodeImg.onload = () => {
            console.log('QR code tải thành công:', qrCodeUrl);
        };

        console.log('Invoice URL:', invoiceUrl);
        console.log('QR Code URL:', qrCodeUrl);
    } catch (error) {
        console.error('Lỗi khi tạo hóa đơn:', error);
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
        customerName: 'Nguyễn Tiến Dũng',
        invoiceFrom: 'Epos Group',
        items: [
            {
                name: 'Bút chì cao cấp',
                quantity: 9,
                price: '550,000đ',
                tax: '10%',
                taxAmount: '50,000đ',
                total: '111,110,000đ'
            }
        ],
        total: '119,990,000đ'
    };

    const jsonString = JSON.stringify(testData);
    console.log('Dữ liệu JSON gốc:', jsonString);

    const safeString = encodeURIComponent(jsonString); // Xử lý ký tự Unicode
    const encodedData = btoa(safeString);
    console.log('Dữ liệu mã hóa base64:', encodedData);

    const testUrl = generateInvoiceUrl(testData);
    const qrCodeUrl = generateQrCodeUrl(testUrl);

    try {
        const decodedData = decodeURIComponent(atob(encodedData));
        const parsedData = JSON.parse(decodedData);
        console.log('Dữ liệu sau khi giải mã:', parsedData);
    } catch (error) {
        console.error('Lỗi giải mã:', error);
    }

    console.log('Test Invoice URL:', testUrl);
    console.log('Test QR Code URL:', qrCodeUrl);
}

// Gọi hàm khi trang tải
window.onload = populateInvoice;
