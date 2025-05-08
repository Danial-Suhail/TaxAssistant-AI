import React from "react";

export function Footer() {
  return (
    <footer className="w-full bg-teal-50 border-t border-teal-100 py-4 mt-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 text-sm text-teal-700">
        <div>
          <span className="font-semibold">Resources:</span>
          <a href="https://www.irs.gov/" target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-teal-600">IRS (US)</a>
          <a href="https://www.canada.ca/en/revenue-agency.html" target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-teal-600">CRA (Canada)</a>
          <a href="https://www.irs.gov/forms-pubs/about-form-1040" target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-teal-600">Form 1040</a>
          <a href="https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package.html" target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-teal-600">Form T1</a>
        </div>
        <div className="mt-2 md:mt-0">
          &copy; {new Date().getFullYear()} TaxAssist AI
        </div>
      </div>
    </footer>
  );
} 