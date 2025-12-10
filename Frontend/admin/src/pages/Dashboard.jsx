import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FaUsers, FaBook, FaFileAlt, FaRoad, FaPencilAlt, 
  FaLayerGroup, FaNewspaper, FaComments, FaChartLine,
  FaGraduationCap, FaTools, FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { 
  UserService, 
  CourseService, 
  LessonService, 
  LearningPathService, 
  NewsService, 
  CommunityService, 
  FlashcardService,
  ExerciseService,
  LearningToolService
} from '../services';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courses: {
      total: 0,
      published: 0,
      draft: 0
    },
    lessons: {
      total: 0,
      published: 0
    },
    learningPaths: {
      total: 0,
      active: 0
    },
    exercises: {
      total: 0
    },
    news: {
      total: 0,
      published: 0
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel using existing API methods
      const [
        coursesData,
        lessonsData,
        learningPathsData,
        newsData
      ] = await Promise.all([
        CourseService.getAllCourses({ page: 1, limit: 10 }),
        LessonService.getAllLessons({ page: 1, limit: 10 }),
        LearningPathService.getAllLearningPaths({ page: 1, limit: 10 }),
        NewsService.getAllNews({ page: 1, limit: 10 })
      ]);

      // Get popular courses
      const popularCoursesData = await CourseService.getAllCourses({
        page: 1,
        limit: 5,
        sort: '-createdAt'
      });

      // Update stats
      setStats({
        courses: {
          total: coursesData.data.pagination.total || 0,
          published: coursesData.data.courses.filter(c => c.isPublished).length,
          draft: coursesData.data.courses.filter(c => !c.isPublished).length
        },
        lessons: {
          total: lessonsData.data.pagination.total || 0,
          published: lessonsData.data.lessons.filter(l => l.isPublished).length
        },
        learningPaths: {
          total: learningPathsData.data.pagination.total || 0,
          active: learningPathsData.data.learningPaths.filter(p => p.isPublished).length
        },
        exercises: {
          total: 0 // Removed since we don't have exercises data yet
        },
        news: {
          total: newsData.data.pagination.total || 0,
          published: newsData.data.news.filter(n => n.isPublished).length || 0
        }
      });

      // Format recent activities from various sources
      const activities = [
        ...(coursesData.data.courses || []).map(course => ({
          type: 'course',
          user: course.creator?.fullName || 'Admin',
          action: course.isPublished ? 'đã xuất bản khóa học' : 'đã tạo khóa học',
          target: course.title,
          timestamp: course.createdAt
        })),
        ...(newsData.data.news || []).map(news => ({
          type: 'news',
          user: news.creator?.fullName || 'Admin',
          action: 'đã đăng tin',
          target: news.title,
          timestamp: news.createdAt
        })),
        ...(learningPathsData.data.learningPaths || []).map(path => ({
          type: 'path',
          user: path.creator?.fullName || 'Admin',
          action: 'đã tạo lộ trình',
          target: path.title,
          timestamp: path.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

      setRecentActivities(activities);
      setPopularCourses(popularCoursesData.data.courses?.slice(0, 5) || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, link, subtitle }) => (
    <Link to={link} className="block">
      <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${color} hover:shadow-md transition-all duration-200`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color.replace('border-', 'bg-')} bg-opacity-10`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{activity.user}</span>
          {' '}{activity.action}
          {' '}<span className="font-medium">{activity.target}</span>
        </p>
        <p className="text-xs text-gray-500">
          {new Date(activity.timestamp).toLocaleString('en-US')}
        </p>
      </div>
    </div>
  );

  const getActivityColor = (type) => {
    const colors = {
      user: 'bg-blue-100 text-blue-600',
      course: 'bg-green-100 text-green-600',
      lesson: 'bg-yellow-100 text-yellow-600',
      exercise: 'bg-purple-100 text-purple-600',
      news: 'bg-pink-100 text-pink-600',
      community: 'bg-indigo-100 text-indigo-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getActivityIcon = (type) => {
    const icons = {
      user: <FaUsers className="w-4 h-4" />,
      course: <FaBook className="w-4 h-4" />,
      lesson: <FaFileAlt className="w-4 h-4" />,
      exercise: <FaPencilAlt className="w-4 h-4" />,
      news: <FaNewspaper className="w-4 h-4" />,
      community: <FaComments className="w-4 h-4" />
    };
    return icons[type] || <FaFileAlt className="w-4 h-4" />;
  };

  const PopularCourseItem = ({ course }) => (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-12 h-12">
        <img
          src={course.thumbnail || 'https://via.placeholder.com/48'}
          alt={course.title}
          className="w-full h-full object-cover rounded"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {course.title}
        </p>
        <p className="text-sm text-gray-500">
          {course.enrollments} students • {course?.rating?.toFixed(1)} ⭐
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchDashboardData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.fullName || 'Admin'}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Courses"
          value={stats.courses.total}
          subtitle={`${stats.courses.published} published`}
          icon={<FaBook className="w-6 h-6" />}
          color="border-green-500"
          link="/courses"
        />
        <StatCard
          title="Lessons"
          value={stats.lessons.total}
          subtitle={`${stats.lessons.published} published`}
          icon={<FaFileAlt className="w-6 h-6" />}
          color="border-yellow-500"
          link="/lessons"
        />
        <StatCard
          title="Learning Paths"
          value={stats.learningPaths.total}
          subtitle={`${stats.learningPaths.active} active`}
          icon={<FaRoad className="w-6 h-6" />}
          color="border-purple-500"
          link="/learning-paths"
        />
        <StatCard
          title="News"
          value={stats.news.total}
          subtitle={`${stats.news.published} published`}
          icon={<FaNewspaper className="w-6 h-6" />}
          color="border-pink-500"
          link="/news"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div>
          <Card
            title="Recent Activities"
            subtitle="Latest activities in the system"
          >
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </Card>
        </div>

        {/* Popular Courses */}
        <div>
          <Card
            title="Latest Courses"
            subtitle="Recently added courses"
          >
            <div className="space-y-4">
              {popularCourses.map((course, index) => (
                <PopularCourseItem key={index} course={course} />
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link to="/courses">
                <Button variant="outline" size="sm">
                  View All Courses
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 