import { useState } from "react";

const workshops = [
  "Web Development Basics",
  "UI/UX Design",
  "Intro to Data Analysis",
  "Digital Marketing",
];

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  workshop: "",
  date: "",
  age: "",
  portfolio: "",
};

function todayString() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

function validate(values, registrations) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Please enter your full name.";
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = "Name must have at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email, for example name@example.com.";
  } else if (
    registrations.some((r) => r.email.toLowerCase() === values.email.trim().toLowerCase())
  ) {
    errors.email = "This email is already registered.";
  }

  const phoneDigits = values.phone.replace(/[\s-]/g, "");
  if (!values.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!/^\+?[0-9]{9,15}$/.test(phoneDigits)) {
    errors.phone = "Enter 9 to 15 digits, for example 0772123456 or +256772123456.";
  }

  if (!values.workshop) {
    errors.workshop = "Please choose a workshop.";
  }

  if (!values.date) {
    errors.date = "Please choose a date.";
  } else if (values.date < todayString()) {
    errors.date = "The date cannot be in the past.";
  }

  if (values.age === "") {
    errors.age = "Please enter your age.";
  } else if (!Number.isInteger(Number(values.age))) {
    errors.age = "Age must be a whole number.";
  } else if (Number(values.age) < 16 || Number(values.age) > 100) {
    errors.age = "Age must be between 16 and 100.";
  }

  if (values.portfolio.trim()) {
    try {
      const url = new URL(values.portfolio.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.portfolio = "The link must start with http:// or https://.";
      }
    } catch {
      errors.portfolio = "Enter a valid link, for example https://myportfolio.com.";
    }
  }

  return errors;
}

function Field({ id, label, error, children }) {
  return (
    <div className="reg-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p id={`${id}-error`} className="reg-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function App() {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccess("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const newErrors = validate(values, registrations);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccess("");
      return;
    }

    const newRegistration = {
      id: Date.now(),
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
    };

    setRegistrations([...registrations, newRegistration]);
    setValues(emptyForm);
    setErrors({});
    setSuccess(`Thank you, ${newRegistration.fullName}! You are registered for ${newRegistration.workshop}.`);
  }

  function handleRemove(id) {
    setRegistrations(registrations.filter((r) => r.id !== id));
    setSuccess("");
  }

  const common = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <main className="reg-page">
      <h1>Workshop Registration</h1>
      <p className="reg-intro">Fill in the form to reserve your place.</p>

      <div className="reg-layout">
        <section className="reg-card">
          <h2>Register</h2>

          {success && (
            <p className="reg-success" role="status">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Field id="fullName" label="Full name" error={errors.fullName}>
              <input type="text" autoComplete="name" required {...common("fullName")} />
            </Field>

            <Field id="email" label="Email address" error={errors.email}>
              <input type="email" autoComplete="email" required {...common("email")} />
            </Field>

            <Field id="phone" label="Phone number" error={errors.phone}>
              <input type="tel" autoComplete="tel" required {...common("phone")} />
            </Field>

            <Field id="workshop" label="Workshop" error={errors.workshop}>
              <select required {...common("workshop")}>
                <option value="">Choose a workshop</option>
                {workshops.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="date" label="Preferred date" error={errors.date}>
              <input type="date" min={todayString()} required {...common("date")} />
            </Field>

            <Field id="age" label="Age" error={errors.age}>
              <input type="number" min="16" max="100" required {...common("age")} />
            </Field>

            <Field id="portfolio" label="Portfolio link (optional)" error={errors.portfolio}>
              <input type="url" placeholder="https://" {...common("portfolio")} />
            </Field>

            <button type="submit" className="reg-btn">
              Register
            </button>
          </form>
        </section>

        <section className="reg-card">
          <h2>Registrations ({registrations.length})</h2>

          {registrations.length === 0 ? (
            <p className="reg-empty">No registrations yet. Your first one will appear here.</p>
          ) : (
            <ul className="reg-list">
              {registrations.map((r) => (
                <li key={r.id} className="reg-item">
                  <div>
                    <strong>{r.fullName}</strong>
                    <p>{r.workshop} · {r.date}</p>
                    <p>{r.email} · {r.phone}</p>
                  </div>
                  <button
                    type="button"
                    className="reg-remove"
                    onClick={() => handleRemove(r.id)}
                    aria-label={`Remove ${r.fullName}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;