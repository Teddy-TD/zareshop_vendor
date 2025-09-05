// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   SafeAreaView,
//   StatusBar,
//   TouchableOpacity,
// } from 'react-native';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   withSequence,
//   interpolate,
// } from 'react-native-reanimated';
// import { 
//   Store,
//   TrendingUp,
//   Users,
//   ArrowRight,
//   Minus,
// } from 'lucide-react-native';
// import { router } from 'expo-router';
// import { COLORS, SIZES } from '@/constants/theme';
// import CustomButton from '@/components/CustomButton';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// interface OnboardingSlide {
//   id: number;
//   title: string;
//   description: string;
//   icon: React.ComponentType<any>;
//   color: string;
// }

// const slides: OnboardingSlide[] = [
//   {
//     id: 1,
//     title: 'Start Selling in Minutes',
//     description: 'Join thousands of vendors across Ethiopia. Set up your digital storefront and reach customers nationwide.',
//     icon: Store,
//     color: COLORS.primary,
//   },
//   {
//     id: 2,
//     title: 'Track Sales & Earnings',
//     description: 'View detailed sales reports and monitor your payouts with real-time analytics.',
//     icon: TrendingUp,
//     color: COLORS.success,
//   },
//   {
//     id: 3,
//     title: 'Grow Your Business',
//     description: 'Reach thousands of customers across Ethiopia and expand your business reach.',
//     icon: Users,
//     color: COLORS.warning,
//   },
// ];

// export default function OnboardingScreen() {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const animationValue = useSharedValue(0);
//   const iconScale = useSharedValue(1);

//   const nextSlide = () => {
//     if (currentSlide < slides.length - 1) {
//       setCurrentSlide(currentSlide + 1);
//       animationValue.value = withTiming((currentSlide + 1) * SCREEN_WIDTH);
      
//       // Icon animation
//       iconScale.value = withSequence(
//         withSpring(1.2, { damping: 10 }),
//         withSpring(1, { damping: 10 })
//       );
//     } else {
//       router.replace('/auth/login');
//     }
//   };

//   const skipToLogin = () => {
//     router.replace('/auth/login');
//   };

//   const slideAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: -animationValue.value }],
//   }));

//   const iconAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: iconScale.value }],
//   }));

//   const SlideContent = ({ slide, index }: { slide: OnboardingSlide; index: number }) => {
//     const IconComponent = slide.icon;
    
//     return (
//       <View style={[styles.slide, { backgroundColor: slide.color + '10' }]}>
//         <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
//           <View style={[styles.iconCircle, { backgroundColor: slide.color }]}>
//             <IconComponent size={48} color={COLORS.white} />
//           </View>
          
//           {/* Animated elements around icon */}
//           <View style={styles.animatedElements}>
//             {index === 0 && (
//               <>
//                 <Animated.View style={[styles.floatingElement, styles.element1]} />
//                 <Animated.View style={[styles.floatingElement, styles.element2]} />
//                 <Animated.View style={[styles.floatingElement, styles.element3]} />
//               </>
//             )}
//             {index === 1 && (
//               <>
//                 <Animated.View style={[styles.chartBar, styles.bar1]} />
//                 <Animated.View style={[styles.chartBar, styles.bar2]} />
//                 <Animated.View style={[styles.chartBar, styles.bar3]} />
//               </>
//             )}
//             {index === 2 && (
//               <>
//                 <Animated.View style={[styles.userDot, styles.user1]} />
//                 <Animated.View style={[styles.userDot, styles.user2]} />
//                 <Animated.View style={[styles.userDot, styles.user3]} />
//                 <Animated.View style={[styles.userDot, styles.user4]} />
//               </>
//             )}
//           </View>
//         </Animated.View>
        
//         <View style={styles.textContent}>
//           <Text style={styles.slideTitle}>{slide.title}</Text>
//           <Text style={styles.slideDescription}>{slide.description}</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
//       {/* Skip Button */}
//       <TouchableOpacity style={styles.skipButton} onPress={skipToLogin}>
//         <Text style={styles.skipText}>Skip</Text>
//       </TouchableOpacity>

//       {/* Slides Container */}
//       <View style={styles.slidesContainer}>
//         {slides.map((slide, index) => (
//           <View
//             key={slide.id}
//             style={[
//               styles.slide,
//               { backgroundColor: slide.color + '10' },
//               { opacity: currentSlide === index ? 1 : 0 }
//             ]}
//           >
//             <SlideContent slide={slide} index={index} />
//           </View>
//         ))}
//       </View>

//       {/* Bottom Section */}
//       <View style={styles.bottomSection}>
//         {/* Page Indicators */}
//         <View style={styles.pagination}>
//           {slides.map((_, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.paginationDot,
//                 {
//                   backgroundColor: currentSlide === index ? COLORS.primary : COLORS.border,
//                   width: currentSlide === index ? 24 : 8,
//                 }
//               ]}
//             />
//           ))}
//         </View>

//         {/* Navigation Button */}
//         <CustomButton
//           title={currentSlide === slides.length - 1 ? "Get Started" : "Next"}
//           onPress={nextSlide}
//           style={styles.nextButton}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   skipButton: {
//     position: 'absolute',
//     top: 60,
//     right: SIZES.md,
//     zIndex: 1,
//     padding: SIZES.sm,
//   },
//   skipText: {
//     fontSize: 16,
//     color: COLORS.textLight,
//     fontWeight: '600',
//   },
//   slidesContainer: {
//     flex: 1,
//     position: 'relative',
//   },
//   slide: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: SIZES.lg,
//     width: '100%',
//     height: '100%',
//   },
//   iconContainer: {
//     position: 'relative',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: SIZES.xxl,
//   },
//   iconCircle: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 16,
//     elevation: 16,
//   },
//   animatedElements: {
//     position: 'absolute',
//     width: 200,
//     height: 200,
//   },
//   floatingElement: {
//     position: 'absolute',
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: COLORS.secondary,
//   },
//   element1: {
//     top: 20,
//     left: 30,
//   },
//   element2: {
//     top: 50,
//     right: 40,
//   },
//   element3: {
//     bottom: 30,
//     left: 20,
//   },
//   chartBar: {
//     position: 'absolute',
//     backgroundColor: COLORS.success,
//     borderRadius: 2,
//     bottom: 40,
//   },
//   bar1: {
//     width: 8,
//     height: 20,
//     left: 50,
//   },
//   bar2: {
//     width: 8,
//     height: 35,
//     left: 65,
//   },
//   bar3: {
//     width: 8,
//     height: 25,
//     left: 80,
//   },
//   userDot: {
//     position: 'absolute',
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.warning,
//   },
//   user1: {
//     top: 30,
//     left: 40,
//   },
//   user2: {
//     top: 20,
//     right: 50,
//   },
//   user3: {
//     bottom: 40,
//     left: 30,
//   },
//   user4: {
//     bottom: 30,
//     right: 40,
//   },
//   textContent: {
//     alignItems: 'center',
//     paddingHorizontal: SIZES.lg,
//   },
//   slideTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     textAlign: 'center',
//     marginBottom: SIZES.md,
//   },
//   slideDescription: {
//     fontSize: 16,
//     color: COLORS.textLight,
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   bottomSection: {
//     paddingHorizontal: SIZES.lg,
//     paddingBottom: SIZES.xl,
//     paddingTop: SIZES.md,
//   },
//   pagination: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: SIZES.xl,
//   },
//   paginationDot: {
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: SIZES.xs,
//   },
//   nextButton: {
//     marginTop: SIZES.md,
//   },
// });