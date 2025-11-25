const twilio = require("twilio");
import { TWILIO_SID, TWILIO_TOKEN, TWILIO_MESSAGING_SERVICE_ID } from './access';

const client = twilio(TWILIO_SID, TWILIO_TOKEN);

export async function sendEfposSMS(req: any, orderCreated: any) {
    console.log('Start to send SMS');
    
    const auMobile = auMobileToIntl(req.phone);
    try {
        let deliveryText = ' and will be delivered by ' + req.shipping_lines[0].title.toLowerCase();
        if (req.shipping_lines[0].title === 'Delivered Today - Between 12pm–5pm') {
            deliveryText = ' and will be delivered by this afternoon';
        }
        if (req.shipping_lines[0].title === 'Delivered Today - Between 6pm–9pm') {
            deliveryText = ' and will be delivered by tonight';
        }
        if (req.shipping_lines[0].title === 'Delivered Tomorrow - Between 12pm–5pm') {
            deliveryText = ' and will be delivered by tomorrow afternoon';
        }
        if (req.shipping_lines[0].title === 'Delivered Tomorrow - Between 6pm–9pm') {
            deliveryText = ' and will be delivered by tomorrow night';
        }

        const message = await client.messages.create({
            messagingServiceSid: TWILIO_MESSAGING_SERVICE_ID,
            to: auMobile,
            body: `Your MediHub order #${orderCreated.id} has been received${deliveryText}. For any questions, contact us at 02 8529 1991.`
        });

        console.log(message);
    } catch (e) {
        console.log(e);
    }
    
}

function auMobileToIntl(number: string) {
  const cleaned = number.replace(/[^\d]/g, '');

  if (cleaned.startsWith('04')) {
    return '+61' + cleaned.slice(1);
  }

  if (cleaned.startsWith('614')) {
    return '+61' + cleaned.slice(2);
  }

  return number;
}