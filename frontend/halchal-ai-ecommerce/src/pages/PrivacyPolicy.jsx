const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-12">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-10">

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Privacy Policy
        </h1>

        <p className="text-gray-600 mb-4">
          Halchal Industries values your privacy. This policy explains how we
          collect, use, and protect your information when using our platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          Information We Collect
        </h2>
        <p className="text-gray-600 mb-4">
          We collect user registration details, order history, and system usage
          data to improve our AI-driven services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          How We Use Data
        </h2>
        <p className="text-gray-600 mb-4">
          Data is used to optimize inventory, improve pricing accuracy, and
          enhance demand forecasting models.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          Security
        </h2>
        <p className="text-gray-600">
          All data is securely stored and processed using industry-standard
          security practices.
        </p>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
