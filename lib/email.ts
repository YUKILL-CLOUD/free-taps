import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Email styles
const styles = {
  container: `
    font-family: 'Arial', sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `,
  header: `
    background-color: #4F6F52;
    color: white;
    padding: 20px;
    border-radius: 8px 8px 0 0;
    text-align: center;
    margin: -20px -20px 20px -20px;
  `,
  title: `
    font-size: 24px;
    margin: 0;
    padding: 0;
  `,
  content: `
    padding: 20px 0;
    color: #333333;
  `,
  list: `
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 15px 30px;
    margin: 15px 0;
  `,
  listItem: `
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    list-style-type: none;
  `,
  highlight: `
    color: #4F6F52;
    font-weight: bold;
  `,
  footer: `
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    font-size: 12px;
    color: #666;
    text-align: center;
  `,
  button: `
    display: inline-block;
    padding: 12px 24px;
    background-color: #4F6F52;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    margin: 15px 0;
  `,
  note: `
    background-color: #fff3cd;
    border-left: 4px solid #ffeeba;
    padding: 12px;
    margin: 15px 0;
    border-radius: 0 6px 6px 0;
  `
};

type AppointmentEmailData = {
  appointmentId: any;
  petName: string;
  serviceName: string;
  date: Date;
  time: Date;
  ownerName?: string;
  status?: string;
  notes?: string | null;
  petId?: string;
};

export async function sendAppointmentEmail(
  to: string,
  type: 'created' | 'status_changed' | 'cancelled' | 'missed' | 'confirmed' | 'pre_appointment' | 'completed',
  data: AppointmentEmailData
) {
  const formattedDate = new Date(data.date).toLocaleDateString();
  const formattedTime = new Date(data.time).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const subjects = {
    created: '🐾 Appointment Confirmation - Tapales Veterinary Clinic',
    status_changed: '🔄 Appointment Status Update - Tapales Veterinary Clinic',
    cancelled: '❌ Appointment Cancelled - Tapales Veterinary Clinic',
    missed: '⚠️ Missed Appointment - Tapales Veterinary Clinic',
    confirmed: '✅ Appointment Confirmed - Tapales Veterinary Clinic',
    pre_appointment: '🐾 Post-Appointment Report - Tapales Veterinary Clinic',
    completed: '✅ Appointment Completed - Tapales Veterinary Clinic'
  };

  const messages = {
    created: `
      <p>Your appointment for ${data.petName} has been scheduled:</p>
      <ul>
        <li>Service: ${data.serviceName}</li>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
        ${data.notes ? `<li>Notes: ${data.notes}</li>` : ''}
      </ul>
      <p>Please wait for confirmation from the clinic.</p>
    `,
    status_changed: `
      <p>Your appointment status has been updated to ${data.status}:</p>
      <ul>
        <li>Pet: ${data.petName}</li>
        <li>Service: ${data.serviceName}</li>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
        <li>New Status: ${data.status}</li>
      </ul>
    `,
    cancelled: `
      <p>Your appointment has been cancelled:</p>
      <ul>
        <li>Pet: ${data.petName}</li>
        <li>Service: ${data.serviceName}</li>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
      </ul>
    `,
    missed: `
      <p>You missed your scheduled appointment:</p>
      <ul>
        <li>Pet: ${data.petName}</li>
        <li>Service: ${data.serviceName}</li>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
      </ul>
      <p>Please contact us to reschedule your appointment.</p>
    `,
    confirmed: `
      <p>Great news! Your appointment has been confirmed by the clinic:</p>
      <ul>
        <li>Pet: ${data.petName}</li>
        <li>Service: ${data.serviceName}</li>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
      </ul>
      <p>Please arrive 10-15 minutes before your scheduled time.</p>
      <h1>Your Appointment ID is ${data.appointmentId}</h1>
      <p>If you need to reschedule or cancel, please contact us at least 24 hours before your appointment.</p>
    `,
    pre_appointment: `
      <p>Reminder: You have an upcoming appointment on ${formattedDate} at ${formattedTime} for ${data.petName} with ${data.serviceName}. See details below:</p>
      <ul>
        <li>Pet: ${data.petName}</li>
        <li>Service: ${data.serviceName}</li>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
      </ul>
      <p>Please arrive 10-15 minutes before your scheduled time.</p>
      <p>Your Appointment ID is ${data.appointmentId}</p>
      <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
    `,
    completed: `
      <p>Your appointment has been completed:</p>
      <ul>
        <li>Pet: ${data.petName}</li>
        <li>Service: ${data.serviceName}</li>
      </ul>
      <p> See the report in your pet's profile: <a href="https://tapalesvet.onrender.com/list/pets/${data.petId}">${data.petName}</a></p>
      <p>Thank you for choosing Tapales Veterinary Clinic.</p>
    `
  };

  const mailOptions = {
    from: `"Tapales Veterinary Clinic" <${process.env.EMAIL_USER}>`,
    to,
    subject: subjects[type],
    html: `
      <div style="${styles.container}">
        <h2 style="${styles.header}">Hello ${data.ownerName || 'there'}!</h2>
        ${messages[type]}
        <p style="${styles.content}">Thank you for choosing Tapales Veterinary Clinic.</p>
        <hr>
        <p style="${styles.note}">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}