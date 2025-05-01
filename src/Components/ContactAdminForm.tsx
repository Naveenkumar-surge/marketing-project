import React, { useState } from "react";
import '../styles/ContactAdminForm.css';

const ContactAdminForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    issueType: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const registerIssue = async (formData: {
    issueType: string;
    email: string;
    description: string;
  }) => {
    try {
      const response = await fetch("https://marketing-nodejs.onrender.com/api/contact-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetch("https://marketing-nodejs.onrender.com/api/sendIssueConfirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            message: `Thanks for contacting us. We’ve received your issue regarding "${formData.issueType}". Our team will get back to you soon.`,
          }),
        });

        return { success: true, message: "Issue registered and confirmation email sent!" };
      } else {
        return { success: false, message: data.message || "Something went wrong while registering the issue." };
      }
    } catch (error) {
      return { success: false, message: "Failed to submit issue. Please try again later." };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await registerIssue(formData);
    setMessage(result.message);
    setMessageType(result.success ? "success" : "error");

    if (result.success) {
      setFormData({ email: "", phoneNumber: "", issueType: "", description: "" });
    }
  };

  return (
    <div className="contact-form-page">
      <div className="contact-form-wrapper">
        <h2>Contact Admin</h2>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Phone Number:</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <label>Issue Type:</label>
          <select
            name="issueType"
            value={formData.issueType}
            onChange={handleSelectChange}
            required
          >
            <option value="">Select Issue Type</option>
            <option value="Login Issue">Login Issue</option>
            <option value="Booking Issue">Booking Issue</option>
            <option value="Payment Issue">Payment Issue</option>
            <option value="Other">Other</option>
          </select>

          <label>Description:</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            required
          />

          <button type="submit">Submit</button>
        </form>

        {message && (
          <div className={`message-box ${messageType}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactAdminForm;
