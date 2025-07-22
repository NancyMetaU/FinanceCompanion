import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/lib/ui/dialog";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import ErrorMessage from "../shared-components/ErrorMessage";
import Loading from "../shared-components/Loading";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const FeedbackModal = ({ isOpen, onClose, article }) => {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("User not authenticated");

      const idToken = await user.getIdToken();

      const articleData = {
        id: article.uuid,
        rating,
        industry: article.entities?.[0]?.industry,
      };

      const response = await fetch(
        `${BACKEND_URL}/api/articleContext/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ articleData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Server responded with status: ${response.status}`
        );
      }

      setSuccess(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Article Feedback</DialogTitle>
        </DialogHeader>

        {isSubmitting ? (
          <div className="py-6">
            <Loading message="Submitting feedback..." />
          </div>
        ) : success ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-base font-medium">
              Thank you for your feedback!
            </p>
            <p className="text-sm text-gray-600">
              You rated this article <strong>{rating}/5</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-5">
                How well did you understand this article?
              </p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`w-10 h-10 rounded-full text-sm font-medium flex items-center justify-center cursor-pointer ${
                      rating >= value
                        ? "bg-royal text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {error && <ErrorMessage message={error} />}

            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="submit"
                disabled={rating === 0}
                className={`px-4 py-2 rounded-md text-white ${
                  rating === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-royal hover:bg-royal/90 cursor-pointer"
                }`}
              >
                Submit Feedback
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
