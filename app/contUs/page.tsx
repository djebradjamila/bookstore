"use client";

import { useState } from "react";

export default function Contact() {
const [submitted, setSubmitted] = useState(false);

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
event.preventDefault();
setSubmitted(true);
};

return ( 
<main className="min-h-screen bg-[#F8F4EC]">
{/* Header */}  
<section className="px-6 py-20 text-center"> <p className="font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
Get in Touch </p>

    <h1 className="mt-3 text-5xl font-bold text-[#071A33]">
      Contact Us
    </h1>

    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
      Have a question, suggestion, or need help?
      We would love to hear from you.
    </p>
  </section>

  {/* Contact Content */}
  <section className="mx-auto max-w-6xl px-6 pb-20">
    <div className="grid gap-10 md:grid-cols-2">

      {/* Information */}
      <div className="rounded-3xl bg-[#071A33] p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E8B04A]">
          BookStore
        </p>

        <h2 className="mt-4 text-3xl font-bold">
          We'd love to hear from you.
        </h2>

        <p className="mt-5 leading-8 text-white/70">
          Whether you have a question about our books, need assistance,
          or simply want to share your feedback, feel free to contact us.
        </p>

        <div className="mt-10 space-y-6">
          <div>
            <p className="text-sm text-white/50">Email</p>
            <p className="mt-1 font-medium">
              contact@bookstore.com
            </p>
          </div>

          <div>
            <p className="text-sm text-white/50">Phone</p>
            <p className="mt-1 font-medium">
              +213 555 000 000
            </p>
          </div>

          <div>
            <p className="text-sm text-white/50">Location</p>
            <p className="mt-1 font-medium">
              Algeria
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        {submitted ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="text-5xl">✓</div>

            <h2 className="mt-5 text-2xl font-bold text-[#071A33]">
              Message Sent!
            </h2>

            <p className="mt-3 text-gray-500">
              Thank you for contacting BookStore.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#071A33]">
                Full Name
              </label>

              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E8B04A]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#071A33]">
                Email
              </label>

              <input
                type="email"
                required
                placeholder="your@email.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E8B04A]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#071A33]">
                Subject
              </label>

              <input
                type="text"
                required
                placeholder="How can we help?"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E8B04A]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#071A33]">
                Message
              </label>

              <textarea
                required
                rows={5}
                placeholder="Write your message..."
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E8B04A]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#071A33] px-6 py-4 font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
            >
              Send Message →
            </button>
          </form>
        )}
      </div>

    </div>
  </section>
</main>
)
};