import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface UploadJob {
  jobId: string;
  fileName: string;
  status: string;
  message: string;
  recordId?: number;
}

interface ProductUploadProgressProps {
  uploadJobs: {
    total: number;
    jobs: UploadJob[];
    message: string;
  };
  onRefresh?: () => void;
}

export default function ProductUploadProgress({ uploadJobs, onRefresh }: ProductUploadProgressProps) {
  if (!uploadJobs || uploadJobs.total === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle size={16} color={COLORS.success} />;
      case 'failed':
        return <AlertCircle size={16} color={COLORS.error} />;
      case 'processing':
        return <Upload size={16} color={COLORS.primary} />;
      default:
        return <Clock size={16} color={COLORS.warning} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return COLORS.success;
      case 'failed':
        return COLORS.error;
      case 'processing':
        return COLORS.primary;
      default:
        return COLORS.warning;
    }
  };

  const completedJobs = uploadJobs.jobs.filter(job => job.status.toLowerCase() === 'completed').length;
  const failedJobs = uploadJobs.jobs.filter(job => job.status.toLowerCase() === 'failed').length;
  const processingJobs = uploadJobs.jobs.filter(job => job.status.toLowerCase() === 'processing').length;
  const queuedJobs = uploadJobs.jobs.filter(job => job.status.toLowerCase() === 'queued').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>File Upload Progress</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{completedJobs}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{processingJobs}</Text>
          <Text style={styles.summaryLabel}>Processing</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{queuedJobs}</Text>
          <Text style={styles.summaryLabel}>Queued</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{failedJobs}</Text>
          <Text style={styles.summaryLabel}>Failed</Text>
        </View>
      </View>

      <View style={styles.jobsList}>
        {uploadJobs.jobs.map((job, index) => (
          <View key={job.jobId} style={styles.jobItem}>
            <View style={styles.jobHeader}>
              {getStatusIcon(job.status)}
              <Text style={styles.fileName} numberOfLines={1}>
                {job.fileName}
              </Text>
            </View>
            <View style={styles.jobDetails}>
              <Text style={[styles.jobStatus, { color: getStatusColor(job.status) }]}>
                {job.status}
              </Text>
              <Text style={styles.jobMessage}>{job.message}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.footerMessage}>{uploadJobs.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginVertical: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  refreshButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  refreshText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
  jobsList: {
    marginBottom: SIZES.md,
  },
  jobItem: {
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  jobDetails: {
    marginLeft: 32,
  },
  jobStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  jobMessage: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  footerMessage: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

