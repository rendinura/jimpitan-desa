import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payloadString = await request.text();
      const payload = JSON.parse(payloadString);
      
      console.log("Webhook received type:", payload.type); // Cek di Logs Convex

      const { data, type } = payload;

      if (type === "user.created" || type === "user.updated") {
        // Ambil email pertama dari array
        const email = data.email_addresses && data.email_addresses.length > 0 
          ? data.email_addresses[0].email_address 
          : "";
        
        const nama = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User Baru";
        const pictureUrl = data.image_url || "";

        console.log("Attempting to sync user:", email);

        await ctx.runMutation(internal.users.createOrUpdateUser, {
          clerkId: data.id,
          email: email,
          nama: nama,
          pictureUrl: pictureUrl,
        });

        console.log("User synced successfully");
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Webhook Error:", error);
      return new Response("Webhook processing failed", { status: 500 });
    }
  }),
});

export default http;