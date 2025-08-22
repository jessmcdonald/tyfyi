import React, { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { LandingPage } from "./components/LandingPage";
import { RecruiterAuth } from "./components/RecruiterAuth";
import { RecruiterDashboard } from "./components/RecruiterDashboard";
import { CandidateSubscription } from "./components/CandidateSubscription";
import { CandidateProfile } from "./components/CandidateProfile";
import { ThankYouPage } from "./components/ThankYouPage";
import { TalentPoolDetail } from "./components/TalentPoolDetail";
import {
  User,
  Subscriber,
  TalentPool,
  CandidateData,
  EnrichedCandidateData,
  authAPI,
  userAPI,
  subscriberAPI,
  talentPoolAPI,
  demoAPI,
} from "./utils/api";

type Page =
  | "landing"
  | "recruiter-auth"
  | "recruiter-dashboard"
  | "candidate-subscription"
  | "candidate-profile"
  | "thank-you"
  | "talent-pool-detail";

export default function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] =
    useState<string>("");
  const [selectedTalentPoolId, setSelectedTalentPoolId] =
    useState<string>("");
  const [candidateData, setCandidateData] =
    useState<CandidateData | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(
    [],
  );
  const [talentPools, setTalentPools] = useState<TalentPool[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize demo data on app start
  useEffect(() => {
    const initDemo = async () => {
      try {
        await demoAPI.initializeDemoData();
      } catch (err) {
        console.warn("Demo data initialization failed:", err);
      }
    };
    initDemo();
  }, []);

  // Load data when user logs in or company is selected
  useEffect(() => {
    if (user || selectedCompanyId) {
      loadData();
    }
  }, [user, selectedCompanyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const companyId =
        user?.id || selectedCompanyId || "demo-company";

      const [subscribersData, talentPoolsData] =
        await Promise.all([
          subscriberAPI.getSubscribers(companyId),
          talentPoolAPI.getTalentPools(companyId),
        ]);

      setSubscribers(subscribersData);
      setTalentPools(talentPoolsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData: User) => {
    setUser(userData);
    setCurrentPage("recruiter-dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setSubscribers([]);
    setTalentPools([]);
    setCurrentPage("landing");
  };

  const viewCompanyPage = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCurrentPage("candidate-subscription");
  };

  const goToCandidateProfile = (data: CandidateData) => {
    setCandidateData(data);
    setCurrentPage("candidate-profile");
  };

  const goToThankYou = () => {
    setCurrentPage("thank-you");
  };

  const handleCandidateProfileComplete = async (
    enrichedData: EnrichedCandidateData,
  ) => {
    try {
      setLoading(true);
      const newSubscriber =
        await subscriberAPI.createSubscriber(enrichedData);
      setSubscribers((prev) => [...prev, newSubscriber]);
      setCurrentPage("thank-you");
    } catch (err) {
      console.error("Failed to create subscriber:", err);
      setError(
        "Failed to save subscriber data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriberUpdate = async (
    updatedSubscriber: Subscriber,
  ) => {
    try {
      setLoading(true);
      const updated = await subscriberAPI.updateSubscriber(
        updatedSubscriber.id,
        updatedSubscriber,
      );
      setSubscribers((prev) =>
        prev.map((sub) =>
          sub.id === updated.id ? updated : sub,
        ),
      );
    } catch (err) {
      console.error("Failed to update subscriber:", err);
      setError(
        "Failed to update subscriber. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTalentPoolCreate = async (
    talentPool: Omit<TalentPool, "id" | "createdDate">,
  ) => {
    try {
      setLoading(true);
      const newTalentPool =
        await talentPoolAPI.createTalentPool(talentPool);
      setTalentPools((prev) => [...prev, newTalentPool]);
    } catch (err) {
      console.error("Failed to create talent pool:", err);
      setError(
        "Failed to create talent pool. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTalentPoolUpdate = async (
    updatedTalentPool: TalentPool,
  ) => {
    try {
      setLoading(true);
      const updated = await talentPoolAPI.updateTalentPool(
        updatedTalentPool.id,
        updatedTalentPool,
      );
      setTalentPools((prev) =>
        prev.map((pool) =>
          pool.id === updated.id ? updated : pool,
        ),
      );
    } catch (err) {
      console.error("Failed to update talent pool:", err);
      setError(
        "Failed to update talent pool. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTalentPoolDelete = async (
    talentPoolId: string,
  ) => {
    try {
      setLoading(true);
      await talentPoolAPI.deleteTalentPool(talentPoolId);
      setTalentPools((prev) =>
        prev.filter((pool) => pool.id !== talentPoolId),
      );
      // Refresh subscribers to update their talent pool associations
      await loadData();
    } catch (err) {
      console.error("Failed to delete talent pool:", err);
      setError(
        "Failed to delete talent pool. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriberDelete = async (
    subscriberId: string,
  ) => {
    try {
      setLoading(true);
      await subscriberAPI.deleteSubscriber(subscriberId);
      setSubscribers((prev) =>
        prev.filter((sub) => sub.id !== subscriberId),
      );
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
      setError(
        "Failed to delete subscriber. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const viewTalentPool = (talentPoolId: string) => {
    setSelectedTalentPoolId(talentPoolId);
    setCurrentPage("talent-pool-detail");
  };

  const goBack = () => {
    if (currentPage === "thank-you") {
      setCurrentPage("candidate-profile");
    } else if (currentPage === "candidate-profile") {
      setCurrentPage("candidate-subscription");
    } else if (currentPage === "candidate-subscription") {
      setCurrentPage("landing");
    } else if (currentPage === "recruiter-auth") {
      setCurrentPage("landing");
    } else if (currentPage === "recruiter-dashboard") {
      setCurrentPage("landing");
    } else if (currentPage === "talent-pool-detail") {
      setCurrentPage("recruiter-dashboard");
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-white">
      {/* Error notification */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 border-2 border-black geometric-shadow-small z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="geometric-block bg-white px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
              <span className="font-medium">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {/* Geometric Navigation */}
      <nav className="border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="geometric-block-inverse px-6 py-3 cursor-pointer hover:geometric-shadow-small transition-all duration-200"
              onClick={() => setCurrentPage("landing")}
            >
              <span className="text-2xl font-black tracking-tight">
                TYFYI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {currentPage !== "landing" && (
                <button
                  className="geometric-block px-6 py-3 hover:geometric-shadow-small transition-all duration-200 font-medium"
                  onClick={goBack}
                >
                  ← BACK
                </button>
              )}
              {user ? (
                <div className="flex items-center space-x-4">
                  <div
                    className="geometric-block px-4 py-2 cursor-pointer hover:geometric-shadow-small transition-all duration-200"
                    onClick={() =>
                      setCurrentPage("recruiter-dashboard")
                    }
                  >
                    <span className="font-medium uppercase tracking-wide">
                      {user.companyName}
                    </span>
                  </div>
                  <button
                    className="geometric-block px-6 py-3 hover:geometric-shadow-small transition-all duration-200 font-medium"
                    onClick={handleLogout}
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                currentPage !== "recruiter-auth" && (
                  <button
                    className="geometric-accent px-8 py-4 border-2 border-black hover:geometric-shadow-small transition-all duration-200 font-bold uppercase tracking-wide"
                    onClick={() =>
                      setCurrentPage("recruiter-auth")
                    }
                  >
                    RECRUITER LOGIN
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="bg-white">
        {currentPage === "landing" && (
          <LandingPage
            onGetStarted={() =>
              setCurrentPage("recruiter-auth")
            }
            onViewDemo={() => viewCompanyPage("demo-company")}
          />
        )}

        {currentPage === "recruiter-auth" && (
          <RecruiterAuth onLogin={handleLogin} />
        )}

        {currentPage === "recruiter-dashboard" && user && (
          <RecruiterDashboard
            user={user}
            onUserUpdate={setUser}
            onViewPage={() => viewCompanyPage(user.id)}
            subscribers={subscribers.filter(
              (sub) =>
                sub.companyId === user.id ||
                sub.companyId === "demo-company",
            )}
            talentPools={talentPools.filter(
              (pool) =>
                pool.companyId === user.id ||
                pool.companyId === "demo-company",
            )}
            onSubscriberUpdate={handleSubscriberUpdate}
            onSubscriberDelete={handleSubscriberDelete}
            onTalentPoolCreate={handleTalentPoolCreate}
            onTalentPoolUpdate={handleTalentPoolUpdate}
            onTalentPoolDelete={handleTalentPoolDelete}
            onTalentPoolView={viewTalentPool}
          />
        )}

        {currentPage === "candidate-subscription" && (
          <CandidateSubscription
            companyId={selectedCompanyId}
            onSubscribe={goToCandidateProfile}
            userSettings={
              user && selectedCompanyId === user.id
                ? {
                    companyName: user.companyName,
                    logoUrl: user.logoUrl,
                    brandColor: user.brandColor,
                    departments: user.departments,
                    introText: user.introText,
                  }
                : undefined
            }
          />
        )}

        {currentPage === "candidate-profile" &&
          candidateData && (
            <CandidateProfile
              data={candidateData}
              onComplete={handleCandidateProfileComplete}
            />
          )}

        {currentPage === "thank-you" && <ThankYouPage />}

        {currentPage === "talent-pool-detail" &&
          user &&
          selectedTalentPoolId && (
            <TalentPoolDetail
              user={user}
              talentPool={
                talentPools.find(
                  (pool) => pool.id === selectedTalentPoolId,
                )!
              }
              subscribers={subscribers.filter(
                (sub) =>
                  sub.companyId === user.id ||
                  sub.companyId === "demo-company",
              )}
              onSubscriberUpdate={handleSubscriberUpdate}
              onSubscriberDelete={handleSubscriberDelete}
            />
          )}
      </main>
    </div>
  );
}