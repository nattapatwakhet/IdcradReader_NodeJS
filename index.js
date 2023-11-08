const http = require('http');
const {
  ThaiCardReader,
  EVENTS,
  MODE,
} = require('@privageapp/thai-national-id-reader');
const usb = require('usb');

const VENDOR_ID = 0x2ce3;
const PRODUCT_ID = 0x9563;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/read-thai-card') {
    const device = usb.findByIds(VENDOR_ID, PRODUCT_ID);
    if (!device) {
      res.statusCode = 404;
      res.end('ไม่พบอุปกรณ์ USB');
    } else {
      device.open();
      console.log('พบอุปกรณ์:', device);
      const reader = new ThaiCardReader();
      reader.readMode = MODE.PERSONAL_PHOTO;
      reader.autoRecreate = true;
      reader.startListener();
      reader.on(EVENTS.READING_COMPLETE, (obj) => {
        console.log(obj);
        console.log('ข้อมูลบัตรประชาชน:', obj);

        // ส่งข้อมูลไปยังหน้าเว็บ HTML
        res.setHeader('Content-Type', 'text/html; charset=utf-8'); // ตั้งค่า charset เป็น utf-8
        res.write('<html><body>');
        res.write('<h1>ข้อมูลบัตรประชาชน</h1>');
        res.write('<pre>' + JSON.stringify(obj, null, 2) + '</pre>');
        res.write('</body></html>');
        res.end();

        // ปิดการอ่านบัตรประชาชนและอุปกรณ์ USB
        reader.close();
        device.close();
      });
    }
  } else {
    res.statusCode = 404;
    res.end('ไม่พบหน้าที่คุณเรียก');
  }
});

const port = 3500;
server.listen(port, () => {
  console.log(`เซิร์ฟเวอร์เริ่มทำงานที่พอร์ต ${port}`);
});
