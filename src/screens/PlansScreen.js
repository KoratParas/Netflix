import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import "./PlansScreen.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { loadStripe } from "@stripe/stripe-js";

function PlansScreen() {
  const [products, setProducts] = useState([]);
  const user = useSelector(selectUser);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      const querySnapshot = await getDocs(
        query(collection(db, "customers", user.uid, "subscriptions"))
      );
      querySnapshot.docs.forEach(async (subscription) => {
        setSubscription({
          role: subscription.data().role,
          current_period_end: subscription.data().current_period_end.seconds,
          current_period_start:
            subscription.data().current_period_start.seconds,
        });
      });
    };

    fetchSubscription();
  }, [user.uid]);

  console.log(subscription);

  useEffect(() => {
    // Fetch products from Firestore where active is true
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "products"), where("active", "==", true))
        );
        const products = {};
        querySnapshot.docs.forEach(async (productDoc) => {
          products[productDoc.id] = productDoc.data();
          const priceSnap = await getDocs(
            query(collection(productDoc.ref, "prices"))
          );
          priceSnap.forEach((priceDoc) => {
            products[productDoc.id].price = {
              priceId: priceDoc.id,
              priceData: priceDoc.data(),
            };
          });
        });

        setProducts(products); // Update state with the fetched products
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const loadCheckout = async (priceId) => {
    try {
      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      // Add a new checkout session to the user's subcollection
      const checkoutSessionsRef = collection(
        db,
        "customers",
        user.uid,
        "checkout_sessions"
      );
      const docRef = await addDoc(checkoutSessionsRef, {
        price: priceId, // Price ID for the session
        success_url: window.location.origin, // URL to redirect on success
        cancel_url: window.location.origin, // URL to redirect on cancellation
      });

      // Listen for real-time updates to the created document
      onSnapshot(docRef, async (snapshot) => {
        const { error, sessionId } = snapshot.data();
        if (error) {
          alert(`An error occured:${error.message}`);
        }
        if (sessionId) {
          // Redirect to Stripe Checkout using the session ID
          const stripe = await loadStripe(
            "pk_test_51QPLpvHX5nY77o1kur8Fs8DyitMImPGI4FQfSZYp28RdHXs3dTkPrmbV283v8pP4nXZcDVPbtZby4GJ0GN1TAvOh00UTm8NncW"
          );
          stripe.redirectToCheckout({ sessionId: sessionId });
        }
      });
    } catch (error) {
      console.error("Error loading checkout session:", error);
    }
  };

  return (
    <div className="plansScreen">
      {subscription && (
        <>
          <br />
          <p>
            Renewal date:{" "}
            {new Date(
              subscription?.current_period_end * 1000
            ).toLocaleDateString()}
          </p>
        </>
      )}
      {Object.entries(products).map(([productId, productData]) => {
        const isCurrentPackage = productData.name
          ?.toLowerCase()
          .includes(subscription?.role);

        return (
          <div
            key={productId}
            className={`${
              isCurrentPackage && "plansScreen__plan--disable"
            } plansScreen__plan`}
          >
            <div className="plansScreen__info">
              <h5>{productData.name}</h5>
              <h6>{productData.description}</h6>
            </div>

            <button
              onClick={() =>
                !isCurrentPackage && loadCheckout(productData.price.priceId)
              }
            >
              {isCurrentPackage ? "Current Package" : "Subscribe"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default PlansScreen;
