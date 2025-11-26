// scripts/seedData.ts
// Run this script once to populate your Supabase database with the mock data
import { supabase } from "../lib/supabase";
import {
  MOCK_COMPANIES,
  MOCK_DEALS,
  MOCK_LEADS,
  MOCK_SEQUENCES,
  MOCK_MEETINGS,
  MOCK_TASKS,
} from "../constants";

async function seedDatabase() {
  console.log("Starting database seed...");

  try {
    // Seed Leads
    console.log("Seeding leads...");
    const leadsToInsert = MOCK_LEADS.map((lead) => ({
      ...lead,
      is_contact_revealed: lead.isContactRevealed || false,
    }));
    const { error: leadsError } = await supabase
      .from("leads")
      .insert(leadsToInsert);
    if (leadsError) throw leadsError;
    console.log(`✓ Seeded ${MOCK_LEADS.length} leads`);

    // Seed Companies
    console.log("Seeding companies...");
    const { error: companiesError } = await supabase
      .from("companies")
      .insert(MOCK_COMPANIES);
    if (companiesError) throw companiesError;
    console.log(`✓ Seeded ${MOCK_COMPANIES.length} companies`);

    // Seed Deals
    console.log("Seeding deals...");
    const { error: dealsError } = await supabase
      .from("deals")
      .insert(MOCK_DEALS);
    if (dealsError) throw dealsError;
    console.log(`✓ Seeded ${MOCK_DEALS.length} deals`);

    // Seed Sequences (with steps)
    console.log("Seeding sequences...");
    for (const sequence of MOCK_SEQUENCES) {
      const { steps, ...sequenceData } = sequence;

      const { data: newSequence, error: seqError } = await supabase
        .from("sequences")
        .insert([sequenceData])
        .select()
        .single();

      if (seqError) throw seqError;

      if (steps && steps.length > 0) {
        const stepsWithSeqId = steps.map((step) => ({
          ...step,
          sequence_id: newSequence.id,
        }));

        const { error: stepsError } = await supabase
          .from("sequence_steps")
          .insert(stepsWithSeqId);

        if (stepsError) throw stepsError;
      }
    }
    console.log(`✓ Seeded ${MOCK_SEQUENCES.length} sequences`);

    // Seed Meetings
    console.log("Seeding meetings...");
    const { error: meetingsError } = await supabase
      .from("meetings")
      .insert(MOCK_MEETINGS);
    if (meetingsError) throw meetingsError;
    console.log(`✓ Seeded ${MOCK_MEETINGS.length} meetings`);

    // Seed Tasks
    console.log("Seeding tasks...");
    const { error: tasksError } = await supabase
      .from("tasks")
      .insert(MOCK_TASKS);
    if (tasksError) throw tasksError;
    console.log(`✓ Seeded ${MOCK_TASKS.length} tasks`);

    // Seed LinkedIn Campaigns
    console.log("Seeding LinkedIn campaigns...");
    const MOCK_LINKEDIN_CAMPAIGNS = [
      {
        name: "CTO Outreach - Series A",
        status: "active",
        target_audience: "CTOs in San Francisco",
        stats: { sent: 145, accepted: 62, replied: 18 },
        steps: [
          { type: "linkedin_visit", order: 1 },
          { type: "wait", delay_days: 1, order: 2 },
          {
            type: "linkedin_connect",
            order: 3,
            content:
              "Hi {{firstName}}, saw you're hiring engineers. Let's connect.",
          },
          { type: "wait", delay_days: 2, order: 4 },
          {
            type: "linkedin_message",
            order: 5,
            content:
              "Thanks for connecting! Quick question about your tech stack...",
          },
        ],
      },
      {
        name: "Hiring Managers - Q3",
        status: "paused",
        target_audience: "VPs of Sales",
        stats: { sent: 300, accepted: 89, replied: 5 },
        steps: [
          {
            type: "linkedin_connect",
            order: 1,
            content: "I admire your work at {{company}}!",
          },
          { type: "wait", delay_days: 3, order: 2 },
          {
            type: "linkedin_message",
            order: 3,
            content: "Would love to chat.",
          },
        ],
      },
    ];

    for (const campaign of MOCK_LINKEDIN_CAMPAIGNS) {
      const { steps, ...campaignData } = campaign;

      const { data: newCampaign, error: campError } = await supabase
        .from("linkedin_campaigns")
        .insert([campaignData])
        .select()
        .single();

      if (campError) throw campError;

      if (steps && steps.length > 0) {
        const stepsWithCampaignId = steps.map((step) => ({
          ...step,
          campaign_id: newCampaign.id,
        }));

        const { error: stepsError } = await supabase
          .from("linkedin_campaign_steps")
          .insert(stepsWithCampaignId);

        if (stepsError) throw stepsError;
      }
    }
    console.log(
      `✓ Seeded ${MOCK_LINKEDIN_CAMPAIGNS.length} LinkedIn campaigns`
    );

    // Seed LinkedIn Messages
    console.log("Seeding LinkedIn messages...");
    const MOCK_LINKEDIN_MESSAGES = [
      {
        sender_name: "Alice Chen",
        sender_avatar:
          "https://ui-avatars.com/api/?name=Alice+Chen&background=random",
        content: "Thanks for reaching out! Yes, we are hiring.",
        time: "10m ago",
        unread: true,
        is_reply: true,
      },
      {
        sender_name: "Bob Wilson",
        sender_avatar:
          "https://ui-avatars.com/api/?name=Bob+Wilson&background=random",
        content: "Sure, let's connect next week.",
        time: "2h ago",
        unread: true,
        is_reply: true,
      },
      {
        sender_name: "Carol Danvers",
        sender_avatar:
          "https://ui-avatars.com/api/?name=Carol+Danvers&background=random",
        content: "I'm not interested right now, thanks.",
        time: "1d ago",
        unread: false,
        is_reply: true,
      },
    ];
    const { error: messagesError } = await supabase
      .from("linkedin_messages")
      .insert(MOCK_LINKEDIN_MESSAGES);
    if (messagesError) throw messagesError;
    console.log(`✓ Seeded ${MOCK_LINKEDIN_MESSAGES.length} LinkedIn messages`);

    // Seed User Lists
    console.log("Seeding user lists...");
    const MOCK_USER_LISTS = [
      { name: "Q3 Outreach", count: 0 },
      { name: "Competitors", count: 0 },
      { name: "Conference Leads", count: 0 },
    ];
    const { error: listsError } = await supabase
      .from("user_lists")
      .insert(MOCK_USER_LISTS);
    if (listsError) throw listsError;
    console.log(`✓ Seeded ${MOCK_USER_LISTS.length} user lists`);

    // Seed Email Messages
    console.log("Seeding email messages...");
    const MOCK_EMAILS = [
      {
        from_address: "John Doe",
        subject: "Re: Meeting next week",
        preview: "Hi Jane, that time works for me...",
        content:
          "Hi Jane,\n\nThat time works for me. See you then!\n\nBest,\nJohn",
        time: "10:30 AM",
        unread: true,
        is_reply: true,
      },
      {
        from_address: "Sarah Smith",
        subject: "Project Proposal",
        preview: "Attached is the proposal we discussed.",
        content:
          "Hi Jane,\n\nPlease find the attached proposal.\n\nThanks,\nSarah",
        time: "Yesterday",
        unread: false,
        is_reply: false,
      },
      {
        from_address: "Support",
        subject: "Ticket #1234 Update",
        preview: "Your issue has been resolved.",
        content: "Your ticket has been closed.",
        time: "Oct 22",
        unread: false,
        is_reply: true,
      },
    ];
    const { error: emailsError } = await supabase
      .from("email_messages")
      .insert(MOCK_EMAILS);
    if (emailsError) throw emailsError;
    console.log(`✓ Seeded ${MOCK_EMAILS.length} email messages`);

    // Seed Content Posts
    console.log("Seeding content posts...");
    const MOCK_POSTS = [
      {
        title: "Product Launch Teaser",
        platform: "linkedin",
        day: 2,
        time: "10:00 AM",
      },
      {
        title: "Industry News Thread",
        platform: "twitter",
        day: 4,
        time: "2:00 PM",
      },
    ];
    const { error: postsError } = await supabase
      .from("content_posts")
      .insert(MOCK_POSTS);
    if (postsError) throw postsError;
    console.log(`✓ Seeded ${MOCK_POSTS.length} content posts`);

    console.log("\n✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seedDatabase();
