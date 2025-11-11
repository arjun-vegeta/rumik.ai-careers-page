import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.aIInsight.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.job.deleteMany()
  
  console.log('Cleared existing job data')

  // Engineering roles
  await prisma.job.create({
    data: {
      title: 'AI Research Engineer',
      jobType: 'engineering',
      salary: 'base pay → 35-65L + approx 10L benefits + esops',
      description: `build memory that works like humans
build sub 100ms latency voice model on top of OSS`,
      details: 'Work on cutting-edge AI research and build memory systems that mimic human cognition. Develop ultra-low latency voice models using open-source foundations.',
      skills: ['AI/ML', 'Python', 'PyTorch', 'Voice Models', 'Memory Systems'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Backend Engineer',
      jobType: 'engineering',
      salary: 'base pay → 30-55L + approx 10L benefits + esops',
      description: `scale to 500m users. 470b tokens/day. make it not crash`,
      details: 'Build and scale backend infrastructure to handle 500 million users and 470 billion tokens per day. Ensure system reliability and performance.',
      skills: ['Node.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'System Design'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'DevOps Engineer',
      jobType: 'engineering',
      salary: 'base pay → 25-50L + approx 10L benefits + esops',
      description: `build infrastructure for 500m daily conversations
manage 100+ gpus
own our model inference`,
      details: 'Build and manage infrastructure for massive scale. Handle GPU clusters and own the entire model inference pipeline.',
      skills: ['Kubernetes', 'Docker', 'AWS/GCP', 'GPU Management', 'Terraform'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'React Native Engineer',
      jobType: 'engineering',
      salary: 'base pay → 25-50L + approx 10L benefits + esops',
      description: `ship ira on ios + android. make it work offline
one codebase. all platforms`,
      details: 'Build cross-platform mobile apps with React Native. Implement offline-first architecture and ensure seamless experience across iOS and Android.',
      skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'Offline-first'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Frontend Engineer',
      jobType: 'engineering',
      salary: 'base pay → 35-50L + approx 10L benefits + esops',
      description: `build web+mobile app for 100m daily users
make it fast. make it beautiful. ship weekly`,
      details: 'Create beautiful, performant web and mobile applications. Ship features weekly and maintain high quality standards.',
      skills: ['React', 'Next.js', 'TypeScript', 'CSS', 'Performance Optimization'],
      isActive: true,
    },
  })

  // Other roles
  await prisma.job.create({
    data: {
      title: 'Designer',
      jobType: 'other',
      salary: 'base pay → 35-50L + approx 10L benefits + esops',
      description: `design the best interface for ai <> human relationship. must have taste`,
      details: 'Design intuitive and beautiful interfaces for AI-human interactions. Must have exceptional taste and attention to detail.',
      skills: ['Figma', 'UI/UX', 'Product Design', 'Prototyping', 'User Research'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Growth Engineer',
      jobType: 'other',
      salary: 'base pay → 30-45L + approx 10L benefits + esops',
      description: `meta + google ads. own the entire funnel from click to purchase`,
      details: 'Own the entire growth funnel. Manage paid advertising campaigns and optimize conversion rates.',
      skills: ['Growth Hacking', 'Analytics', 'Meta Ads', 'Google Ads', 'A/B Testing'],
      isActive: true,
    },
  })

  // Internships
  await prisma.job.create({
    data: {
      title: 'AI Research Engineering Intern',
      jobType: 'internship',
      salary: 'stipend → 50K/month + PPO if you do exceptional work',
      description: `ship memory models to prod in week 2`,
      details: 'Work on cutting-edge AI research. Ship production-ready memory models within your first two weeks.',
      skills: ['AI/ML', 'Python', 'PyTorch', 'Research'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Backend Intern',
      jobType: 'internship',
      salary: 'stipend → 50K/month + PPO if you do exceptional work',
      description: `handle 1m users solo`,
      details: 'Build and scale backend systems. Own features that serve millions of users.',
      skills: ['Node.js', 'PostgreSQL', 'System Design'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Engineering Intern',
      jobType: 'internship',
      salary: 'stipend → 50K/month + PPO if you do exceptional work',
      description: `make 10 models work together in under 2s latency`,
      details: 'Optimize and orchestrate multiple AI models to work together with ultra-low latency.',
      skills: ['Python', 'System Design', 'Performance Optimization'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Growth Intern',
      jobType: 'internship',
      salary: 'stipend → 50K/month + PPO if you do exceptional work',
      description: `find 10k users without spending money`,
      details: 'Drive organic growth through creative strategies. Acquire thousands of users with zero ad spend.',
      skills: ['Growth Hacking', 'Marketing', 'Analytics'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Writer Intern',
      jobType: 'internship',
      salary: 'stipend → 50K/month + PPO if you do exceptional work',
      description: `write ad scripts that get 1m+ views`,
      details: 'Create viral ad content. Write scripts that resonate and drive millions of views.',
      skills: ['Copywriting', 'Content Creation', 'Storytelling'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Video Intern',
      jobType: 'internship',
      salary: 'stipend → 50K/month + PPO if you do exceptional work',
      description: `edit videos that make people remember it even after days`,
      details: 'Create memorable video content. Edit videos that leave lasting impressions.',
      skills: ['Video Editing', 'Premiere Pro', 'After Effects'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Design Intern',
      jobType: 'internship',
      salary: 'stipend → 50K/month + PPO if you do exceptional work',
      description: `redesign onboarding. ship to 1m users week 1`,
      details: 'Design impactful user experiences. Ship designs to millions of users in your first week.',
      skills: ['Figma', 'UI/UX', 'Product Design'],
      isActive: true,
    },
  })

  await prisma.job.create({
    data: {
      title: 'Product Intern',
      jobType: 'internship',
      salary: 'stipend → 50K/month + PPO if you do exceptional work',
      description: `talk to 10 users/day, run 5 experiments every week. ship 2 that work`,
      details: 'Own product features end-to-end. Talk to users daily, run experiments, and ship what works.',
      skills: ['Product Management', 'User Research', 'Analytics'],
      isActive: true,
    },
  })

  console.log('Seeded jobs successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
