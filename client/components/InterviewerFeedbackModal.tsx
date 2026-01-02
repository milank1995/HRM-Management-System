import { useState } from "react";
import { Dialog } from "./Dialog";
import { Save } from "lucide-react";

interface FeedbackData {
  score: number;
  status: "pass" | "fail";
  feedback: string;
}

interface InterviewerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackData) => void;
  candidateName: string;
  interviewRound: string;
}

export const InterviewerFeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  interviewRound,
}: InterviewerFeedbackModalProps) => {
  const [formData, setFormData] = useState<FeedbackData>({
    score: 5,
    status: "pass",
    feedback: "",
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ score: 5, status: "pass", feedback: "" });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Interview Feedback"
      description={`${candidateName} • ${interviewRound}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Score Slider */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Score: <span className="text-primary font-semibold">{formData.score}/10</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={formData.score}
            onChange={(e) =>
              setFormData({ ...formData, score: parseFloat(e.target.value) })
            }
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="pass"
                checked={formData.status === "pass"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "pass" | "fail",
                  })
                }
                className="w-4 h-4 text-primary cursor-pointer"
              />
              <span className="text-foreground font-medium">Pass</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="fail"
                checked={formData.status === "fail"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "pass" | "fail",
                  })
                }
                className="w-4 h-4 text-primary cursor-pointer"
              />
              <span className="text-foreground font-medium">Fail</span>
            </label>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Feedback *
          </label>
          <textarea
            value={formData.feedback}
            onChange={(e) =>
              setFormData({ ...formData, feedback: e.target.value })
            }
            placeholder="Provide detailed feedback about the interview..."
            rows={4}
            className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.feedback.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            Submit Feedback
          </button>
        </div>
      </div>
    </Dialog>
  );
};
