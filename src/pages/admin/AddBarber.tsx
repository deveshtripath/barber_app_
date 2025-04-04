import React, { useState } from "react";
import { addBarber } from "../../lib/firebase"; // Import the addBarber function

const AddBarber: React.FC = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(""); // Image URL field
  const [availability, setAvailability] = useState("Available");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]); // Available times
  const [specialties, setSpecialties] = useState<
    { name: string; description: string; time: number; money: number }[]
  >([]); // Array of specialties
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSpecialtyChange = (index: number, field: string, value: any) => {
    const updatedSpecialties = [...specialties];
    updatedSpecialties[index][field] = value;
    setSpecialties(updatedSpecialties);
  };

  const addSpecialty = () => {
    setSpecialties([
      ...specialties,
      { name: "", description: "", time: 60, money: 20 }, // Default values
    ]);
  };

  const removeSpecialty = (index: number) => {
    const updatedSpecialties = specialties.filter((_, i) => i !== index);
    setSpecialties(updatedSpecialties);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Prepare the barber data
      const barberData = {
        name,
        contact,
        profileImage: profileImage ? URL.createObjectURL(profileImage) : null,
        specialties, // Array of specialties
        imageUrl, // Image URL
        availability, // Availability
        phone, // Phone number
        location, // Location
        availableTimes, // Available times
      };

      // Call the function to add barber to the database
      await addBarber(barberData);

      // On success, reset form fields
      setSuccess("Barber added successfully!");
      setName("");
      setContact("");
      setProfileImage(null);
      setImageUrl("");
      setAvailability("Available");
      setPhone("");
      setLocation("");
      setAvailableTimes([]);
      setSpecialties([]); // Reset specialties
    } catch (err: any) {
      setError(err.message || "Failed to add barber");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add Barber</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>

        {/* Specialty Section */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">Specialties</h2>
          {specialties.map((specialty, index) => (
            <div key={index} className="mb-4 border p-4 rounded-md">
              <div className="mb-2">
                <label className="block mb-2">Specialty Name</label>
                <input
                  type="text"
                  value={specialty.name}
                  onChange={(e) => handleSpecialtyChange(index, "name", e.target.value)}
                  required
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-2">Specialty Description</label>
                <input
                  type="text"
                  value={specialty.description}
                  onChange={(e) => handleSpecialtyChange(index, "description", e.target.value)}
                  required
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-2">Specialty Time (minutes)</label>
                <input
                  type="number"
                  value={specialty.time}
                  onChange={(e) => handleSpecialtyChange(index, "time", +e.target.value)}
                  required
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-2">Specialty Price ($)</label>
                <input
                  type="number"
                  value={specialty.money}
                  onChange={(e) => handleSpecialtyChange(index, "money", +e.target.value)}
                  required
                  className="border p-2 w-full"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSpecialty(index)}
                className="bg-red-500 text-white p-2 mt-2"
              >
                Remove Specialty
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpecialty}
            className="bg-blue-500 text-white p-2 mt-4"
          >
            Add Specialty
          </button>
        </div>

        {/* Contact and Profile */}
        <div className="mb-4">
          <label className="block mb-2">Contact</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Profile Image</label>
          <input
            type="file"
            onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
            className="border p-2 w-full"
          />
        </div>

        {/* Other Fields */}
        <div className="mb-4">
          <label className="block mb-2">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Availability</label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Available Times (comma-separated)</label>
          <input
            type="text"
            value={availableTimes.join(", ")}
            onChange={(e) =>
              setAvailableTimes(e.target.value.split(",").map((time) => time.trim()))
            }
            className="border p-2 w-full"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2">
          Add Barber
        </button>
      </form>
    </div>
  );
};

export default AddBarber;