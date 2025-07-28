import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Zap, 
  Share, 
  Download, 
  Edit,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Building,
  Eye,
  Settings
} from 'lucide-react';

const portfolioData = {
  name: 'Amit Kumar',
  title: 'Senior Software Engineer',
  description: 'Experienced software engineer with 1+ years of expertise in full-stack development, cloud computing, and team leadership. Passionate about building scalable applications and mentoring junior developers.',
  contact: {
    email: 'amit@gmail.com',
    phone: '+91 9334571861',
    location: 'Indore, India'
  },
  links: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    website: 'Website'
  },
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Coincent',
      period: '09/2024 - 10/2024',
      description: 'Lead development of microservices architecture serving 1M+ users. Mentored junior developers and improved deployment efficiency by 40%.',
      achievements: [
        'Reduced API response time by 60%',
        'Led team of 5 developers',
        'Implemented CI/CD pipeline'
      ]
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      period: '2022 - 2024',
      description: 'Developed full-stack web applications using React and Node.js. Collaborated with design team to implement responsive UI components.',
      achievements: [
        'Built 3 major product features',
        'Optimized database queries',
        'Increased test coverage to 85%'
      ]
    }
  ],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with payment integration and inventory management.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe']
    },
    {
      name: 'Task Management App',
      description: 'Collaborative task management application with real-time updates and team features.',
      technologies: ['Vue.js', 'Firebase', 'Socket.io']
    }
  ],
  skills: {
    languages: ['JavaScript', 'C++', 'Python', 'TypeScript', 'Java'],
    frontend: ['React', 'Vue.js', 'Next.js', 'Angular'],
    backend: ['Node.js', 'Express', 'Django', 'FastAPI'],
    databases: ['MongoDB', 'PostgreSQL', 'Redis', 'MySQL'],
    cloud: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    tools: ['Git', 'VS Code', 'Postman', 'Figma']
  },
  education: {
    degree: 'B.Tech in Computer Science',
    institution: 'Indore Institute of Science and Technology',
    period: '2022-2026',
    gpa: '7.9/10'
  }
};

export const Portfolio = () => {
  return (
    <div>
      <DashboardHeader title="Portfolio" />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Your professional portfolio - auto-generated from your profile</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-border/50 text-foreground hover:bg-secondary/50">
              <Zap className="w-4 h-4 mr-2" />
              AI Optimize
            </Button>
            <Button variant="outline" className="border-border/50 text-foreground hover:bg-secondary/50">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="border-border/50 text-foreground hover:bg-secondary/50">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Preview/Edit Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button variant="ghost" className="text-foreground bg-secondary/50">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Portfolio Content */}
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
          <div className="p-8">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{portfolioData.name}</h1>
              <p className="text-xl text-muted-foreground mb-4">{portfolioData.title}</p>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {portfolioData.description}
              </p>
              
              {/* Contact Info */}
              <div className="flex justify-center space-x-8 mt-6">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{portfolioData.contact.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{portfolioData.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{portfolioData.contact.location}</span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex justify-center space-x-4 mt-6">
                <Button variant="outline" size="sm" className="border-border/50 text-foreground hover:bg-secondary/50">
                  <Github className="w-4 h-4 mr-2" />
                  {portfolioData.links.github}
                </Button>
                <Button variant="outline" size="sm" className="border-border/50 text-foreground hover:bg-secondary/50">
                  <Linkedin className="w-4 h-4 mr-2" />
                  {portfolioData.links.linkedin}
                </Button>
                <Button variant="outline" size="sm" className="border-border/50 text-foreground hover:bg-secondary/50">
                  <Globe className="w-4 h-4 mr-2" />
                  {portfolioData.links.website}
                </Button>
              </div>
            </div>

            {/* Professional Experience */}
            <div className="mb-12">
              <div className="flex items-center space-x-2 mb-6">
                <Building className="w-5 h-5 text-foreground" />
                <h2 className="text-2xl font-bold text-foreground">Professional Experience</h2>
              </div>
              
              <div className="space-y-8">
                {portfolioData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-6">
                    <h3 className="text-xl font-semibold text-foreground">{exp.title}</h3>
                    <p className="text-muted-foreground mb-2">{exp.company} • {exp.period}</p>
                    <p className="text-muted-foreground mb-4">{exp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.achievements.map((achievement, i) => (
                        <Badge key={i} variant="outline" className="border-border/50 text-foreground">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Projects */}
            <div className="mb-12">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-5 h-5 bg-foreground rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-background rounded-xs"></div>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Featured Projects</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.projects.map((project, index) => (
                  <Card key={index} className="bg-secondary/30 border-border/30">
                    <div className="p-6">
                      <div className="w-12 h-12 bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <div className="w-6 h-6 bg-foreground rounded-sm"></div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{project.name}</h3>
                      <p className="text-muted-foreground mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="border-border/50 text-foreground hover:bg-secondary/50">
                          <Github className="w-3 h-3 mr-1" />
                          Code
                        </Button>
                        <Button variant="outline" size="sm" className="border-border/50 text-foreground hover:bg-secondary/50">
                          <Globe className="w-3 h-3 mr-1" />
                          Demo
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Technical Skills</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Programming Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.languages.map((skill, i) => (
                      <Badge key={i} variant="outline" className="border-border/50 text-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Frontend Frameworks</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.frontend.map((skill, i) => (
                      <Badge key={i} variant="outline" className="border-border/50 text-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Backend Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.backend.map((skill, i) => (
                      <Badge key={i} variant="outline" className="border-border/50 text-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Databases</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.databases.map((skill, i) => (
                      <Badge key={i} variant="outline" className="border-border/50 text-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Cloud & DevOps</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.cloud.map((skill, i) => (
                      <Badge key={i} variant="outline" className="border-border/50 text-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.tools.map((skill, i) => (
                      <Badge key={i} variant="outline" className="border-border/50 text-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-5 h-5 bg-foreground rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-background rounded-xs"></div>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Education</h2>
              </div>
              
              <div className="border-l-2 border-primary/30 pl-6">
                <h3 className="text-xl font-semibold text-foreground">{portfolioData.education.degree}</h3>
                <p className="text-muted-foreground mb-1">{portfolioData.education.institution} • {portfolioData.education.period}</p>
                <p className="text-muted-foreground">GPA: {portfolioData.education.gpa}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;