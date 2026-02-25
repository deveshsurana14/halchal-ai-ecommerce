const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-12">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-10">

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Terms & Conditions
        </h1>

        <p className="text-gray-600 mb-4">
          By using Halchal Industries platform, you agree to comply with these
          terms and conditions.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          Platform Usage
        </h2>
        <p className="text-gray-600 mb-4">
          Users must provide accurate information while placing orders and
          interacting with AI pricing features.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          Pricing Disclaimer
        </h2>
        <p className="text-gray-600 mb-4">
          All prices displayed are subject to admin approval and may vary
          depending on market demand.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          Limitation of Liability
        </h2>
        <p className="text-gray-600">
          Halchal Industries is not liable for indirect losses arising from
          system usage.
        </p>

      </div>
    </div>
  );
};

export default TermsAndConditions;
