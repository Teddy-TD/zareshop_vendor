import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.white,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: SIZES.md,
		paddingTop: SIZES.lg,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.card,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.text,
	},
	progressContainer: {
		paddingHorizontal: SIZES.md,
		paddingBottom: SIZES.lg,
	},
	progressBar: {
		height: 4,
		backgroundColor: COLORS.border,
		borderRadius: 2,
		marginBottom: SIZES.sm,
	},
	progressFill: {
		height: '100%',
		backgroundColor: COLORS.primary,
		borderRadius: 2,
	},
	progressText: {
		fontSize: 12,
		color: COLORS.textLight,
		textAlign: 'center',
	},
	content: {
		flex: 1,
		paddingHorizontal: SIZES.md,
	},
	stepContainer: {
		paddingBottom: SIZES.xl,
	},
	stepTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: SIZES.xs,
	},
	stepSubtitle: {
		fontSize: 16,
		color: COLORS.textLight,
		marginBottom: SIZES.lg,
	},
	inputGroup: {
		marginBottom: SIZES.lg,
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SIZES.sm,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		borderRadius: SIZES.radius,
		paddingHorizontal: SIZES.md,
		paddingVertical: SIZES.md,
	},
	textInput: {
		flex: 1,
		marginLeft: SIZES.sm,
		fontSize: 16,
		color: COLORS.text,
	},
	textArea: {
		height: 80,
		textAlignVertical: 'top',
	},
	navigation: {
		flexDirection: 'row',
		padding: SIZES.md,
		alignItems: 'center',
	},
	backButtonText: {
		fontSize: 16,
		color: COLORS.textLight,
		fontWeight: '600',
		paddingHorizontal: SIZES.md,
	},
	nextButton: {
		flex: 1,
	},
});


