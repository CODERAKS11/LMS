import React from "react";
import moment from "moment";

const EachUserProfile = ({ user }) => {
  if (!user) {
    return (
      <div className="text-center text-red-500 py-10">
        User not found or no data available.
      </div>
    );
  }

  const safeBookTitle = (book) =>
    book?.bookId?.title || book?.bookTitle || "Unknown Title";

  const safeBookAuthor = (book) =>
    book?.bookId?.author || book?.bookAuthor || "Unknown Author";

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 my-8">
      <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
      <p className="mb-1"><strong>Email:</strong> {user.email}</p>
      <p className="mb-1"><strong>Role:</strong> {user.role}</p>
      <p className="mb-1"><strong>Department:</strong> {user.department || "N/A"}</p>
      <p className="mb-1"><strong>Phone:</strong> {user.phone || "N/A"}</p>
      <p className="mb-1"><strong>Total Books Read:</strong> {user.totalBooksRead || 0}</p>

      {/* Badges & Milestones */}
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Reading Achievements</h3>

        <div>
          <h4 className="font-semibold">Badges:</h4>
          {user.badges?.length ? (
            <ul className="flex flex-wrap gap-2 mt-1">
              {user.badges.map((badge, idx) => (
                <li
                  key={idx}
                  className="px-3 py-1 bg-yellow-300 rounded-full text-sm font-medium shadow"
                >
                  {badge}
                </li>
              ))}
            </ul>
          ) : (
            <p>No badges earned yet.</p>
          )}
        </div>

        <div className="mt-2">
          <h4 className="font-semibold">Milestones:</h4>
          {user.milestones?.length ? (
            <ul className="flex flex-wrap gap-2 mt-1">
              {user.milestones.map((milestone, idx) => (
                <li
                  key={idx}
                  className="px-3 py-1 bg-green-200 rounded-full text-sm font-medium shadow"
                >
                  {milestone}
                </li>
              ))}
            </ul>
          ) : (
            <p>No milestones reached yet.</p>
          )}
        </div>
      </div>

      {/* Borrowed Books */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Borrowed Books</h3>
        {user.borrowedBooks?.length ? (
          <ul className="space-y-4">
            {user.borrowedBooks
              .filter((book) => book?.status === "borrowed")
              .map((book, idx) => (
                <li key={book?._id || idx} className="border-b pb-4">
                  <p><strong>Title:</strong> {safeBookTitle(book)}</p>
                  <p><strong>Author:</strong> {safeBookAuthor(book)}</p>
                  <p>
                    <strong>Borrowed Date:</strong>{" "}
                    {book?.borrowedDate
                      ? moment(book.borrowedDate).format("DD-MM-YYYY")
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {book?.dueDate
                      ? moment(book.dueDate).format("DD-MM-YYYY")
                      : "N/A"}
                  </p>
                  <p><strong>Status:</strong> {book?.status || "N/A"}</p>
                  <p><strong>Renewals:</strong> {book?.renewals || 0}</p>

                  {book?.fine > 0 && (
                    <p className="text-red-600">
                      <strong>Fine:</strong> ₹{book.fine}
                    </p>
                  )}

                  {/* Renewal History */}
                  {book?.renewalHistory?.length ? (
                    <div className="bg-gray-100 p-2 mt-2 rounded-md">
                      <h4 className="text-sm font-semibold">Renewal History:</h4>
                      {book.renewalHistory.map((renew, idx2) => (
                        <div key={idx2}>
                          <p>
                            <strong>Renewed:</strong>{" "}
                            {moment(renew.renewedDate).format("DD-MM-YYYY")}
                          </p>
                          <p>
                            <strong>New Due Date:</strong>{" "}
                            {moment(renew.newDueDate).format("DD-MM-YYYY")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
          </ul>
        ) : (
          <p>No books currently borrowed.</p>
        )}
      </div>

      {/* Reservations */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Reservations</h3>
        {user.reservations?.length ? (
          <ul className="space-y-4">
            {user.reservations.map((reservation, idx) => (
              <li key={reservation?._id || idx} className="border-b pb-4">
                <p>
                  <strong>Book Title:</strong>{" "}
                  {reservation?.bookId?.title || "Unknown"}
                </p>
                <p>
                  <strong>Reserved Date:</strong>{" "}
                  {reservation?.reservedDate
                    ? moment(reservation.reservedDate).format("DD-MM-YYYY")
                    : "N/A"}
                </p>
                <p><strong>Status:</strong> {reservation?.status || "N/A"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reservations made.</p>
        )}
      </div>

      {/* Fines */}
      <div className="mt-6 bg-red-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Outstanding Fines</h3>
        {user.borrowedBooks?.some((b) => b?.fine > 0) ? (
          <ul>
            {user.borrowedBooks
              .filter((b) => b?.fine > 0)
              .map((book, idx) => (
                <li key={book?._id || idx}>
                  <strong>{safeBookTitle(book)}:</strong> ₹{book.fine}
                </li>
              ))}
          </ul>
        ) : (
          <p>No outstanding fines.</p>
        )}
      </div>
    </div>
  );
};

export default EachUserProfile;
