import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Error verifying SMTP connection:', error);
      } else {
        console.log('SMTP connection verified successfully!');
      }
    }
    );
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    try {
      console.log('Sending OTP to:', email);
      await this.transporter.sendMail({
        from: `"Kayrota OTP" <${this.configService.get<string>('MAIL_USER')}>`,
        to: email,
        subject: 'Your OTP Code',
        text: `Here is your OTP code:  ${otp}  . It will expire in 10 minutes.`,
      });
      console.log('OTP sent!');
    } catch (error) {
      console.error('Error sending OTP email:', error.message);
      throw error;
    }
  }
}
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';

// @Injectable()
// export class MailService {
//   private transporter: nodemailer.Transporter;

//   constructor(private configService: ConfigService) {
//     this.transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       auth: {
//         user: this.configService.get('MAIL_USER'),
//         pass: this.configService.get('MAIL_PASS'),
//       },
//     });
//   }

//   async sendOTP(email: string, otp: string): Promise<void> {
//     try {
//       console.log('Sending OTP to:', email);
//       await this.transporter.sendMail({
//         from: `"Kayrota OTP" <${this.configService.get('MAIL_USER')}>`,
//         to: email,
//         subject: 'Your OTP Code',
//         text: `Here is your OTP code: ${otp}. It will expire in 10 minutes.`,
//       });
//       console.log('OTP sent!');
//     } catch (error) {
//       console.error('Error sending OTP email:', error.message);
//       throw error;
//     }
//   }
// }