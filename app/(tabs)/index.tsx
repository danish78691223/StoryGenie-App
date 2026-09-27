import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const intro = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const createScale = useRef(new Animated.Value(1)).current;
  const savedScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(intro, { toValue: 1, duration: 850, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ),
    ]).start();
  }, []);

  const press = (value, toValue) =>
    Animated.spring(value, { toValue, friction: 7, tension: 90, useNativeDriver: true }).start();

  return (
    <LinearGradient colors={["#0B1026", "#171449", "#432C78", "#7C4DFF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.container}>
      <Animated.View pointerEvents="none" style={[styles.orbOne,{transform:[{translateY:float.interpolate({inputRange:[0,1],outputRange:[0,-24]})}]}]} />
      <Animated.View pointerEvents="none" style={[styles.orbTwo,{transform:[{translateY:float.interpolate({inputRange:[0,1],outputRange:[0,30]})}]}]} />
      <View style={styles.glow} />

      <Animated.View style={[styles.content,{opacity:intro,transform:[{translateY:intro.interpolate({inputRange:[0,1],outputRange:[35,0]})}]}]}>
        <View style={styles.badge}><View style={styles.badgeDot}/><Text style={styles.badgeText}>AI STORY STUDIO</Text></View>
        <View style={styles.logoCircle}><Text style={styles.logoEmoji}>✨</Text></View>
        <Text style={styles.title}>StoryGenie</Text>
        <Text style={styles.subtitle}>Turn a simple idea into an immersive story, scene by scene.</Text>

        <View style={styles.featureRow}>
          <View style={styles.featurePill}><Ionicons name="sparkles" size={15} color="#DCD3FF"/><Text style={styles.featureText}>AI powered</Text></View>
          <View style={styles.featurePill}><Ionicons name="book-outline" size={15} color="#DCD3FF"/><Text style={styles.featureText}>Personalized</Text></View>
          <View style={styles.featurePill}><Ionicons name="headset-outline" size={15} color="#DCD3FF"/><Text style={styles.featureText}>Read aloud</Text></View>
        </View>

        <Animated.View style={{transform:[{scale:createScale}],width:"100%"}}>
          <Pressable onPressIn={()=>press(createScale,0.97)} onPressOut={()=>press(createScale,1)} onPress={()=>router.push("/create-story")}>
            <LinearGradient colors={["#FFFFFF","#EDE8FF"]} style={styles.primaryButton}>
              <View style={styles.buttonIcon}><Ionicons name="sparkles" size={20} color="#6C4DFF"/></View>
              <View style={styles.buttonCopy}><Text style={styles.primaryTitle}>Create a new story</Text><Text style={styles.primarySub}>Bring your imagination to life</Text></View>
              <Ionicons name="arrow-forward" size={22} color="#6C4DFF"/>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View style={{transform:[{scale:savedScale}],width:"100%"}}>
          <Pressable onPressIn={()=>press(savedScale,0.97)} onPressOut={()=>press(savedScale,1)} onPress={()=>router.push("/saved-stories")} style={styles.secondaryButton}>
            <View style={styles.secondaryIcon}><Ionicons name="library-outline" size={21} color="#FFFFFF"/></View>
            <Text style={styles.secondaryText}>Explore saved stories</Text>
            <Ionicons name="chevron-forward" size={20} color="#CFC8FF"/>
          </Pressable>
        </Animated.View>
        <Text style={styles.footerHint}>Create • Imagine • Read • Repeat</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,alignItems:"center",justifyContent:"center",overflow:"hidden"},
  content:{width:"100%",maxWidth:560,alignItems:"center",paddingHorizontal:24},
  orbOne:{position:"absolute",width:290,height:290,borderRadius:145,backgroundColor:"rgba(115,92,255,0.22)",top:-80,right:-95},
  orbTwo:{position:"absolute",width:230,height:230,borderRadius:115,backgroundColor:"rgba(0,224,255,0.12)",bottom:-75,left:-75},
  glow:{position:"absolute",width:180,height:180,borderRadius:90,backgroundColor:"rgba(145,120,255,0.14)"},
  badge:{flexDirection:"row",alignItems:"center",paddingHorizontal:12,paddingVertical:7,borderRadius:999,backgroundColor:"rgba(255,255,255,0.10)",borderWidth:1,borderColor:"rgba(255,255,255,0.16)",marginBottom:20},
  badgeDot:{width:7,height:7,borderRadius:4,backgroundColor:"#8BFFB0",marginRight:7},
  badgeText:{color:"#E8E4FF",fontSize:11,fontWeight:"800",letterSpacing:1.6},
  logoCircle:{width:84,height:84,borderRadius:42,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,255,255,0.12)",borderWidth:1,borderColor:"rgba(255,255,255,0.22)",marginBottom:16},
  logoEmoji:{fontSize:38},
  title:{color:"#FFFFFF",fontSize:48,lineHeight:54,fontWeight:"900",letterSpacing:-1.5},
  subtitle:{color:"#D8D4EF",fontSize:16,lineHeight:24,textAlign:"center",maxWidth:420,marginTop:10,marginBottom:22},
  featureRow:{flexDirection:"row",flexWrap:"wrap",justifyContent:"center",gap:8,marginBottom:30},
  featurePill:{flexDirection:"row",alignItems:"center",gap:6,backgroundColor:"rgba(255,255,255,0.08)",borderWidth:1,borderColor:"rgba(255,255,255,0.10)",paddingHorizontal:10,paddingVertical:7,borderRadius:999},
  featureText:{color:"#DCD7F4",fontSize:12,fontWeight:"600"},
  primaryButton:{minHeight:74,borderRadius:22,paddingHorizontal:15,flexDirection:"row",alignItems:"center",width:"100%",shadowColor:"#000",shadowOpacity:0.2,shadowRadius:18,shadowOffset:{width:0,height:10},elevation:8},
  buttonIcon:{width:45,height:45,borderRadius:15,backgroundColor:"#EEE9FF",alignItems:"center",justifyContent:"center"},
  buttonCopy:{flex:1,marginLeft:12},
  primaryTitle:{color:"#22203A",fontSize:16,fontWeight:"900"},
  primarySub:{color:"#77728E",fontSize:12,marginTop:3},
  secondaryButton:{width:"100%",minHeight:62,borderRadius:20,paddingHorizontal:15,marginTop:12,flexDirection:"row",alignItems:"center",backgroundColor:"rgba(255,255,255,0.09)",borderWidth:1,borderColor:"rgba(255,255,255,0.14)"},
  secondaryIcon:{width:42,height:42,borderRadius:14,backgroundColor:"rgba(255,255,255,0.10)",alignItems:"center",justifyContent:"center"},
  secondaryText:{flex:1,marginLeft:12,color:"#FFFFFF",fontSize:15,fontWeight:"800"},
  footerHint:{color:"#AAA4CF",fontSize:11,letterSpacing:1.2,marginTop:24},
});