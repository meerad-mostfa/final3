//import calculateDaysDiff from '../src/client/js/app';
// __tests__/app.test.js

beforeEach(() => {
  document.body.innerHTML = `
    <button id="add-trip-button">Add Trip</button>
    <input id="trip-city" value="Paris" />
    <input id="trip-date" value="2024-10-01" />
    <input id="end-date" value="2024-10-10" />
  `;

  // تحويل addEventListener إلى دالة Mock
  jest.spyOn(HTMLElement.prototype, 'addEventListener');
});

afterEach(() => {
  jest.restoreAllMocks(); // استعادة الدوال الأصلية بعد كل اختبار
});

test('should add event listener to the button', () => {
  require('../src/client/js/app'); // تأكد من استيراد الملف الذي يحتوي على الكود الخاص بك
  
  const button = document.getElementById("add-trip-button");
  expect(button).not.toBeNull();
  
  // تحقق من أن `addEventListener` تم استدعاؤه
  expect(button.addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
});


