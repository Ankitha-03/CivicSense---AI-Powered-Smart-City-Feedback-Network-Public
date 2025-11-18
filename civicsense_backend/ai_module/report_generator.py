# civicsense_backend/ai_module/report_generator.py

from django.db.models import Count, Q
from datetime import datetime, timedelta
from django.utils import timezone
import json

class CityHealthReportGenerator:
    """
    Generates AI-powered city health reports
    """
    
    def __init__(self, issues_model):
        self.Issue = issues_model
    
    def generate_weekly_report(self):
        """
        Generate a comprehensive weekly city health report
        """
        # Get date range for last 7 days
        end_date = timezone.now()
        start_date = end_date - timedelta(days=7)
        
        # Get all issues from last week
        weekly_issues = self.Issue.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Category breakdown
        category_stats = weekly_issues.values('category').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Status breakdown
        status_stats = weekly_issues.values('status').annotate(
            count=Count('id')
        )
        
        # Calculate health score (0-100)
        total_issues = weekly_issues.count()
        resolved_issues = weekly_issues.filter(status='resolved').count()
        pending_issues = weekly_issues.filter(status='pending').count()
        
        if total_issues > 0:
            resolution_rate = (resolved_issues / total_issues) * 100
            # Health score: higher is better
            # Penalize for high pending issues
            health_score = max(0, 100 - (pending_issues / max(total_issues, 1)) * 100)
        else:
            resolution_rate = 100
            health_score = 100
        
        # Identify hotspots (areas with most issues)
        hotspots = self._identify_hotspots(weekly_issues)
        
        # Trend analysis
        trend = self._analyze_trend()
        
        # Generate AI insights
        insights = self._generate_insights(
            total_issues,
            category_stats,
            resolution_rate,
            health_score
        )
        
        report = {
            'generated_at': end_date.isoformat(),
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': 7
            },
            'summary': {
                'total_issues': total_issues,
                'resolved': resolved_issues,
                'pending': pending_issues,
                'in_progress': weekly_issues.filter(status='in_progress').count(),
                'resolution_rate': round(resolution_rate, 2),
                'health_score': round(health_score, 2)
            },
            'category_breakdown': list(category_stats),
            'status_breakdown': list(status_stats),
            'hotspots': hotspots,
            'trend': trend,
            'ai_insights': insights,
            'recommendations': self._generate_recommendations(category_stats)
        }
        
        return report
    
    def _identify_hotspots(self, issues):
        """
        Identify geographical hotspots with clustering
        """
        # Simple implementation: group by approximate location
        hotspots = []
        
        # Get issues with coordinates
        issues_with_coords = issues.exclude(
            Q(latitude__isnull=True) | Q(longitude__isnull=True)
        )
        
        if issues_with_coords.count() > 0:
            # Group by rounded coordinates (0.01 degree ~ 1km)
            location_groups = {}
            
            for issue in issues_with_coords:
                lat_rounded = round(issue.latitude, 2)
                lng_rounded = round(issue.longitude, 2)
                key = f"{lat_rounded},{lng_rounded}"
                
                if key not in location_groups:
                    location_groups[key] = []
                location_groups[key].append(issue)
            
            # Get top 5 hotspots
            sorted_hotspots = sorted(
                location_groups.items(),
                key=lambda x: len(x[1]),
                reverse=True
            )[:5]
            
            for location, issues_list in sorted_hotspots:
                lat, lng = map(float, location.split(','))
                hotspots.append({
                    'location': {'lat': lat, 'lng': lng},
                    'issue_count': len(issues_list),
                    'categories': list(set(i.category for i in issues_list))
                })
        
        return hotspots
    
    def _analyze_trend(self):
        """
        Analyze trend compared to previous week
        """
        now = timezone.now()
        
        # This week
        this_week_start = now - timedelta(days=7)
        this_week_count = self.Issue.objects.filter(
            created_at__gte=this_week_start
        ).count()
        
        # Last week
        last_week_start = now - timedelta(days=14)
        last_week_end = now - timedelta(days=7)
        last_week_count = self.Issue.objects.filter(
            created_at__gte=last_week_start,
            created_at__lt=last_week_end
        ).count()
        
        if last_week_count > 0:
            change_percent = ((this_week_count - last_week_count) / last_week_count) * 100
        else:
            change_percent = 0 if this_week_count == 0 else 100
        
        if change_percent > 10:
            trend_direction = 'increasing'
        elif change_percent < -10:
            trend_direction = 'decreasing'
        else:
            trend_direction = 'stable'
        
        return {
            'direction': trend_direction,
            'change_percent': round(change_percent, 2),
            'this_week': this_week_count,
            'last_week': last_week_count
        }
    
    def _generate_insights(self, total, category_stats, resolution_rate, health_score):
        """
        Generate AI-powered insights
        """
        insights = []
        
        # Health score insight
        if health_score >= 80:
            insights.append({
                'type': 'positive',
                'message': f'City health score is excellent at {health_score:.0f}/100'
            })
        elif health_score >= 60:
            insights.append({
                'type': 'warning',
                'message': f'City health score is moderate at {health_score:.0f}/100. There is room for improvement.'
            })
        else:
            insights.append({
                'type': 'critical',
                'message': f'City health score is low at {health_score:.0f}/100. Immediate action required.'
            })
        
        # Category insights
        if category_stats:
            top_category = category_stats[0]
            insights.append({
                'type': 'info',
                'message': f'Most reported issue type: {top_category["category"]} ({top_category["count"]} reports)'
            })
        
        # Resolution rate insight
        if resolution_rate < 50:
            insights.append({
                'type': 'warning',
                'message': f'Low resolution rate of {resolution_rate:.1f}%. Consider allocating more resources.'
            })
        elif resolution_rate > 80:
            insights.append({
                'type': 'positive',
                'message': f'Excellent resolution rate of {resolution_rate:.1f}%!'
            })
        
        return insights
    
    def _generate_recommendations(self, category_stats):
        """
        Generate actionable recommendations
        """
        recommendations = []
        
        if not category_stats:
            return ['Continue monitoring city issues']
        
        # Top category recommendation
        top_category = category_stats[0]
        category_name = top_category['category'].replace('_', ' ').title()
        
        recommendations.append(
            f"Prioritize resources for {category_name} issues ({top_category['count']} reports)"
        )
        
        # Add category-specific recommendations
        if top_category['category'] == 'road_damage':
            recommendations.append("Schedule road maintenance survey in affected areas")
        elif top_category['category'] == 'garbage':
            recommendations.append("Increase garbage collection frequency in hotspot areas")
        elif top_category['category'] == 'electrical':
            recommendations.append("Conduct electrical infrastructure inspection")
        elif top_category['category'] == 'water_supply':
            recommendations.append("Check water distribution system for leaks")
        
        return recommendations