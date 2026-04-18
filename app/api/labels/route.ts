import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { orderNumber, city, storeName, clientName, phone, address } =
    await request.json();

  const { error } = await supabase.from("labels").insert([
    {
      order_number: orderNumber,
      city,
      store_name: storeName,
      client_name: clientName,
      phone,
      address,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
