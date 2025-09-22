import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import emailjs from 'emailjs-com';

// Initialize Firebase app and Firestore (do this only once in your app, ideally in a service)
const app = initializeApp(environment.firebase);
const db = getFirestore(app);
const serviceID = 'service_j72hpvm'; // <- your Email Service ID
const templateID = 'template_olikn3j'; // <- your Email Template ID
const publicKey = 'ZKjqGy85CqlJ3Eukj'; // <- your Email Public Key
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserComponent>
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      sendWeeklyEmail: [false],
    });
  }

  closeForm(): void {
    this.dialogRef.close(); // This closes the dialog
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      try {
        await addDoc(collection(db, 'users'), userData);
        emailjs
          .send(
            serviceID,
            templateID,
            {
              to_name: userData.firstName,
              to_email: userData.email,
              password: userData.password,
            },
            publicKey
          )
          .then(() => {
            alert('User created & email sent!');
            this.userForm.reset();
            this.closeForm();
          })
          .catch((err) => console.error('EmailJS Error:', err));
      } catch (error) {
        alert('Error adding user: ' + (error as any).message);
      }
    } else {
      alert('Please fill all required fields.');
    }
  }
}
