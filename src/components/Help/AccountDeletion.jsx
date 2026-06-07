export default function AccountDeletion() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Support
      </p>

      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Account Deletion
      </h1>

      <p className="text-lg text-gray-600 leading-8 mb-10">
        You can permanently delete your Kedhar Farms account directly from the
        mobile application.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          How to Delete Your Account
        </h2>

        <ol className="list-decimal pl-6 space-y-3 text-gray-700 leading-7">
          <li>Open the Kedhar Farms app.</li>
          <li>Go to Profile or Settings.</li>
          <li>Select Delete Account.</li>
          <li>Confirm your deletion request.</li>
        </ol>
      </section>

      <div className="border-t my-8" />

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Unable to Access the App?
        </h2>

        <p className="text-gray-700 leading-7 mb-4">
          If you are unable to access the application, please contact us using
          your registered mobile number or email address.
        </p>

        <a
          href="mailto:kedharfarms@gmail.com"
          className="text-green-700 font-medium hover:underline"
        >
          kedharfarms@gmail.com
        </a>
      </section>

      <div className="border-t my-8" />

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Data Removal
        </h2>

        <p className="text-gray-700 leading-7">
          Once your deletion request is verified, your account and associated
          personal information will be permanently removed from our systems,
          except where retention is required by applicable laws or regulations.
        </p>
      </section>
    </div>
  );
}