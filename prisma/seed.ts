import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Engineering Roles
  await prisma.job.createMany({
    data: [
      {
        title: 'AI Research Engineer',
        jobType: 'engineering',
        description: `💵 base pay → 35-65L + approx 10L benefits + esops

Build memory that works like humans
Build sub 100ms latency voice model on top of OSS`,
        skills: ['AI/ML', 'Python', 'Research', 'Voice Models', 'Low Latency'],
        isActive: true,
      },
      {
        title: 'Backend Engineer',
        jobType: 'engineering',
        description: `💵 base pay → 30-55L + approx 10L benefits + esops

Scale to 500m users. 470b tokens/day. Make it not crash`,
        skills: ['Backend', 'Scalability', 'Node.js', 'Distributed Systems', 'High Performance'],
        isActive: true,
      },
      {
        title: 'DevOps Engineer',
        jobType: 'engineering',
        description: `💵 base pay → 25-50L + approx 10L benefits + esops

Build infrastructure for 500m daily conversations.
Manage 100+ GPUs.
Own our model inference.`,
        skills: ['DevOps', 'Kubernetes', 'GPU Management', 'Infrastructure', 'MLOps'],
        isActive: true,
      },
      {
        title: 'React Native Engineer',
        jobType: 'engineering',
        description: `💵 base pay → 25-50L + approx 10L benefits + esops

Ship ira on iOS + Android. Make it work offline.
One codebase. All platforms.`,
        skills: ['React Native', 'iOS', 'Android', 'Offline-first', 'Mobile'],
        isActive: true,
      },
      {
        title: 'Frontend Engineer',
        jobType: 'engineering',
        description: `💵 base pay → 35-50L + approx 10L benefits + esops

Build web+mobile app for 100m daily users.
Make it fast. Make it beautiful. Ship weekly.`,
        skills: ['React', 'TypeScript', 'Frontend', 'Performance', 'UI/UX'],
        isActive: true,
      },
    ],
  })

  // Other Roles
  await prisma.job.createMany({
    data: [
      {
        title: 'Designer',
        jobType: 'other',
        description: `💵 base pay → 35-50L + approx 10L benefits + esops

Design the best interface for AI <> human relationship. Must have taste.`,
        skills: ['UI/UX Design', 'Product Design', 'Figma', 'User Research', 'Taste'],
        isActive: true,
      },
      {
        title: 'Growth Engineer',
        jobType: 'other',
        description: `💵 base pay → 30-45L + approx 10L benefits + esops

Meta + Google ads. Own the entire funnel from click to purchase.`,
        skills: ['Growth', 'Marketing', 'Analytics', 'A/B Testing', 'Ads'],
        isActive: true,
      },
    ],
  })

  // Internships
  await prisma.job.createMany({
    data: [
      {
        title: 'AI Research Engineering Intern',
        jobType: 'internship',
        description: `💵 stipend → 50K/month + PPO if you do exceptional work

Ship memory models to prod in week 2`,
        skills: ['AI/ML', 'Research', 'Python', 'Deep Learning'],
        isActive: true,
      },
      {
        title: 'Backend Engineering Intern',
        jobType: 'internship',
        description: `💵 stipend → 50K/month + PPO if you do exceptional work

Handle 1m users solo`,
        skills: ['Backend', 'Node.js', 'Scalability', 'Databases'],
        isActive: true,
      },
      {
        title: 'Engineering Intern',
        jobType: 'internship',
        description: `💵 stipend → 50K/month + PPO if you do exceptional work

Make 10 models work together in under 2s latency`,
        skills: ['Engineering', 'Performance', 'Systems', 'AI Integration'],
        isActive: true,
      },
      {
        title: 'Growth Intern',
        jobType: 'internship',
        description: `💵 stipend → 50K/month + PPO if you do exceptional work

Find 10k users without spending money`,
        skills: ['Growth', 'Marketing', 'Organic Growth', 'Community'],
        isActive: true,
      },
      {
        title: 'Writer Intern',
        jobType: 'internship',
        description: `💵 stipend → 50K/month + PPO if you do exceptional work

Write ad scripts that get 1m+ views`,
        skills: ['Writing', 'Copywriting', 'Content', 'Storytelling'],
        isActive: true,
      },
      {
        title: 'Video Editing Intern',
        jobType: 'internship',
        description: `💵 stipend → 50K/month + PPO if you do exceptional work

Edit videos that make people remember it even after days`,
        skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'Storytelling'],
        isActive: true,
      },
      {
        title: 'Design Intern',
        jobType: 'internship',
        description: `💵 stipend → 50K/month + PPO if you do exceptional work

Redesign onboarding. Ship to 1m users week 1`,
        skills: ['UI/UX', 'Figma', 'Product Design', 'User Research'],
        isActive: true,
      },
      {
        title: 'Product Intern',
        jobType: 'internship',
        description: `💵 stipend → 50K/month + PPO if you do exceptional work

Talk to 10 users/day, run 5 experiments every week. Ship 2 that work.`,
        skills: ['Product Management', 'User Research', 'A/B Testing', 'Analytics'],
        isActive: true,
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
