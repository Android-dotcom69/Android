import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";

const SEED_MEMBERS = [
    { name: "Nethra", role: "head" },
    { name: "Rahul", role: "member" },
    { name: "Aryan", role: "member" },
    { name: "Priya", role: "member" },
];

export async function GET() {
    try {
        await connectDB();
        let members = await Member.find().sort({ createdAt: 1 });

        if (members.length === 0) {
            await Member.insertMany(SEED_MEMBERS);
            members = await Member.find().sort({ createdAt: 1 });
        }

        return Response.json(members);
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to fetch members" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const member = await Member.create(body);
        return Response.json(member, { status: 201 });
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to create member" }, { status: 500 });
    }
}
