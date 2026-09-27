"use client";

import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name");
    const email = formData.get("email");
    const subject = formData.get("subject");
    const message = formData.get("message");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to send message.");
      }

      setSubmitted(true);
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setError("Unable to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <section className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
            Get in Touch
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#071A33] md:text-4xl">
            Contact Us
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600">
            Have a question, suggestion, or need help?
            We would love to hear from you.
          </p>
        </section>

        {/* Contact Content */}
        <section className="pb-8">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Information */}
            <div className="rounded-2xl bg-[#071A33] p-6 text-white shadow-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E8B04A]">
                BookStore
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                We'd love to hear from you.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70">
                Whether you have a question about our books,
                need assistance, or want to share your feedback,
                feel free to contact us.
              </p>

              <div className="mt-7 space-y-4">
                <div>
                  <p className="text-xs text-white/50">Email</p>
                  <p className="mt-1 text-sm font-medium">
                    contact@bookstore.com
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/50">Phone</p>
                  <p className="mt-1 text-sm font-medium">
                    +213 555 000 000
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/50">Location</p>
                  <p className="mt-1 text-sm font-medium">
                    Algeria
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl bg-white p-6 shadow-md">
              {submitted ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                  <div className="text-5xl text-green-600">
                    ✓
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-[#071A33]">
                    Message Sent!
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Thank you for contacting BookStore.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-5 rounded-full bg-[#E8B04A] px-6 py-2.5 text-sm font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      required
                      placeholder="Your name"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                    >
                      Email
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                    >
                      Subject
                    </label>

                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      required
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Write your message..."
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[#071A33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}