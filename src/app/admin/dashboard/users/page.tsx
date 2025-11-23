import { supabase } from "@/lib/supabase";
import type { User, Batch } from "@/lib/types";
import { UsersClient } from "./UsersClient";

async function getUsers() {
  const { data, error } = await supabase.from("users").select("*");
  return { users: data as User[], error };
}

async function getBatches() {
  const { data, error } = await supabase.from("batches").select("*");
  return { batches: data as Batch[], error };
}

export default async function AdminUsersPage() {
  const [usersResult, batchesResult] = await Promise.all([
    getUsers(),
    getBatches(),
  ]);

  const { users, error: usersError } = usersResult;
  const { batches, error: batchesError } = batchesResult;

  if (usersError || batchesError) {
    const errorMessages = [];
    if (usersError) errorMessages.push(usersError.message);
    if (batchesError) errorMessages.push(batchesError.message);
    return <p>তথ্য আনতে সমস্যা হয়েছে: {errorMessages.join(", ")}</p>;
  }

  return <UsersClient initialUsers={users} initialBatches={batches} />;
}
