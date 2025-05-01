import React, { useState } from "react";
import { FaWhatsapp, FaBars, FaTimes } from "react-icons/fa";
const countryCode = "91";
const phoneNumber = "6305552364";
const defaultMessage = encodeURIComponent("Hello! I would like to know more about your services.");
const whatsappLink = `https://wa.me/${countryCode}${phoneNumber}?text=${defaultMessage}`;

const NavigationBar: React.FC<{ setActiveSection: (section: string) => void }> = ({ setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = (section: string) => {
    setActiveSection(section);
    setIsMenuOpen(false); // Close menu on mobile
  };

  return (
    <nav className="bg-pink-500 text-white p-4 fixed top-0 w-full z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/image.jpg" alt="King Card" className="w-8 h-8 rounded-full" />
          <h1 className="text-white text-xl font-bold">King Carding</h1>
        </div>

        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center">
          <li>
            <button onClick={() => handleLinkClick("home")} className="hover:text-gray-300">Home</button>
          </li>
          <li>
            <button onClick={() => handleLinkClick("about")} className="hover:text-gray-300">About</button>
          </li>
          <li>
            <button onClick={() => handleLinkClick("career")} className="hover:text-gray-300">Career</button>
          </li>
          <li>
            <button onClick={() => handleLinkClick("contact")} className="hover:text-gray-300">Contact Us</button>
          </li>
          <li>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-300"
            >
              <FaWhatsapp size={24} />
            </a>
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 px-4">
          <ul className="flex flex-col space-y-4 text-lg">
            <li>
              <button onClick={() => handleLinkClick("home")} className="hover:text-gray-300 w-full text-left">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick("about")} className="hover:text-gray-300 w-full text-left">
                About
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick("career")} className="hover:text-gray-300 w-full text-left">
                Career
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick("contact")} className="hover:text-gray-300 w-full text-left">
                Contact Us
              </button>
            </li>
            <li>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-300 flex items-center space-x-2"
              >
                <FaWhatsapp size={20} />
                <span>WhatsApp</span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
