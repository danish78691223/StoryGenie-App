// app/story-viewer.tsx
// @ts-nocheck

import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const BACKEND_URL = "https://storygenie-backend.onrender.com";

export default function StoryViewer() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { character, storyType, ageGroup, language, fromSaved } = params;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [bgMusic, setBgMusic] = useState(null);
  const [saving, setSaving] = useState(false);
  const intro = useRef(new Animated.Value(0)).current;
  const selectedLanguage = language || "English";

  useEffect(() => {
    loadOrGenerateStory();
    return () => { Speech.stop(); stopBackgroundMusic(); };
  }, []);

  useEffect(() => {
    if (!loading) Animated.timing(intro,{toValue:1,duration:700,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start();
  }, [loading]);

  const loadOrGenerateStory = async () => {
    try {
      setLoading(true);
      if (fromSaved === "true") {
        const savedData = await AsyncStorage.getItem("currentStory");
        if (!savedData) throw new Error("Saved story could not be loaded.");
        setStory(JSON.parse(savedData));
        return;
      }
      const response = await fetch(BACKEND_URL + "/api/generate-story", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({character,storyType,ageGroup,language:selectedLanguage}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Story generation failed.");
      setStory(data);
    } catch (error) {
      console.log("Story error:",error);
      setStory({title:"Story unavailable",paragraphs:[{id:"error",text:error?.message || "Failed to generate story.",image:null}]});
    } finally { setLoading(false); }
  };

  const saveStory = async () => {
    if (!story || saving) return;
    try {
      setSaving(true);
      const newStory = {id:Date.now().toString(),character,storyType,ageGroup,language:selectedLanguage,title:story.title,styleGuide:story.styleGuide,characters:story.characters||[],paragraphs:story.paragraphs||[],story:story.story,images:(story.paragraphs||[]).map(p=>p.image).filter(Boolean),date:new Date().toISOString()};
      const existing=await AsyncStorage.getItem("savedStories");
      const savedStories=existing?JSON.parse(existing):[];
      savedStories.push(newStory);
      await AsyncStorage.setItem("savedStories",JSON.stringify(savedStories));
      alert("Story saved successfully! 🎉");
    } catch(error) { console.log("Save error:",error); alert("Could not save this story."); }
    finally { setSaving(false); }
  };

  const getMusicFile=()=>{
    const lower=String(storyType||"").toLowerCase();
    if(lower.includes("adventure")) return require("@/assets/audio/Adventure.mp3");
    if(lower.includes("funny")) return require("@/assets/audio/Funny.mp3");
    if(lower.includes("moral")) return require("@/assets/audio/Moral.mp3");
    if(lower.includes("fairy")) return require("@/assets/audio/FairyTale.mp3");
    if(lower.includes("fantasy")) return require("@/assets/audio/Fantasy.mp3");
    if(lower.includes("inspirational")) return require("@/assets/audio/Inspirational.mp3");
    if(lower.includes("space")) return require("@/assets/audio/SpaceStory.mp3");
    if(lower.includes("bedtime")) return require("@/assets/audio/Bedtime.mp3");
    if(lower.includes("mystery")) return require("@/assets/audio/Mystery.mp3");
    return require("@/assets/audio/Common.mp3");
  };

  const playBackgroundMusic=async()=>{
    try {
      if(bgMusic)return;
      const sound=new Audio.Sound();
      await sound.loadAsync(getMusicFile());
      await sound.setIsLoopingAsync(true);
      await sound.setVolumeAsync(.35);
      setBgMusic(sound);
      await sound.playAsync();
    } catch(error){console.log("Music error:",error);}
  };

  const stopBackgroundMusic=async()=>{
    try {
      if(bgMusic){await bgMusic.stopAsync();await bgMusic.unloadAsync();setBgMusic(null);}
    } catch(error){console.log("Stop music error:",error);}
  };

  const speakStory=async()=>{
    if(!story?.paragraphs?.length)return;
    let langCode="en-US";
    if(selectedLanguage==="Hindi")langCode="hi-IN";
    if(selectedLanguage==="Marathi")langCode="mr-IN";
    if(selectedLanguage==="Urdu")langCode="ur-IN";
    setSpeaking(true); await playBackgroundMusic(); Speech.stop();
    Speech.speak(story.paragraphs.map(p=>p.text).join(" "),{
      language:langCode,rate:.95,pitch:1,
      onDone:()=>{stopBackgroundMusic();setSpeaking(false);},
      onStopped:()=>{stopBackgroundMusic();setSpeaking(false);},
      onError:()=>{stopBackgroundMusic();setSpeaking(false);}
    });
  };

  const stopStory=()=>{Speech.stop();stopBackgroundMusic();setSpeaking(false);};

  if(loading) return (
    <LinearGradient colors={["#0B1026","#24154F","#6D4CFF"]} style={styles.loader}>
      <View style={styles.loaderOrb}><Text style={styles.loaderEmoji}>✨</Text></View>
      <Text style={styles.loadingTitle}>Your story is taking shape</Text>
      <Text style={styles.loadingText}>Gemini is writing your world and preparing each scene.</Text>
      <View style={styles.loadingBar}><View style={styles.loadingFill}/></View>
      <Text style={styles.loadingHint}>Dreaming up something magical...</Text>
    </LinearGradient>
  );

  const paragraphs=story?.paragraphs||[];

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.glow}/>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{opacity:intro,transform:[{translateY:intro.interpolate({inputRange:[0,1],outputRange:[25,0]})}]}}>
          <View style={styles.topBar}>
            <Pressable onPress={()=>router.back()} style={styles.iconButton}><Ionicons name="arrow-back" size={20} color="#29263E"/></Pressable>
            <View style={styles.modeBadge}><View style={styles.dot}/><Text style={styles.modeText}>STORY MODE</Text></View>
            <View style={{flex:1}}/>
            <Pressable onPress={speaking?stopStory:speakStory} style={[styles.iconButton, speaking&&styles.activeIcon]}>
              <Ionicons name={speaking?"stop":"volume-high-outline"} size={19} color={speaking?"#FFF":"#6D4CFF"}/>
            </Pressable>
          </View>

          <LinearGradient colors={["#FFFFFF","#F0ECFF"]} style={styles.heroCard}>
            <View style={styles.heroSpark}><Ionicons name="sparkles" size={18} color="#6D4CFF"/></View>
            <Text style={styles.eyebrow}>A STORY BY STORYGENIE</Text>
            <Text style={styles.title}>{story?.title||"Your Story"}</Text>
            <Text style={styles.meta}>{selectedLanguage} • {storyType} • {ageGroup}</Text>
          </LinearGradient>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={saveStory} disabled={saving}>
              <Ionicons name="bookmark-outline" size={18} color="#6D4CFF"/>
              <Text style={styles.actionText}>{saving?"Saving...":"Save story"}</Text>
            </Pressable>
            <Pressable style={[styles.actionButton,speaking&&styles.actionDark]} onPress={speaking?stopStory:speakStory}>
              <Ionicons name={speaking?"stop":"headset-outline"} size={18} color={speaking?"#FFF":"#6D4CFF"}/>
              <Text style={[styles.actionText,speaking&&styles.actionTextWhite]}>{speaking?"Stop":"Read aloud"}</Text>
            </Pressable>
          </View>

          <View style={styles.storyStats}>
            <View><Text style={styles.statValue}>{paragraphs.length}</Text><Text style={styles.statLabel}>SCENES</Text></View>
            <View style={styles.statLine}/>
            <View><Text style={styles.statValue}>{selectedLanguage}</Text><Text style={styles.statLabel}>LANGUAGE</Text></View>
            <View style={styles.statLine}/>
            <View><Text style={styles.statValue}>{ageGroup||"All"}</Text><Text style={styles.statLabel}>AUDIENCE</Text></View>
          </View>

          {paragraphs.map((paragraph,index)=><SceneCard key={paragraph.id||index} paragraph={paragraph} index={index} total={paragraphs.length}/>)}

          <View style={styles.endCard}>
            <View style={styles.endIcon}><Text style={styles.endEmoji}>🌟</Text></View>
            <Text style={styles.endTitle}>The End</Text>
            <Text style={styles.endText}>Thanks for exploring this little world with StoryGenie.</Text>
            <Pressable style={styles.createAnother} onPress={()=>router.push("/create-story")}>
              <Text style={styles.createAnotherText}>Create another story</Text><Ionicons name="arrow-forward" size={17} color="#6D4CFF"/>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function SceneCard({paragraph,index,total}){
  const reveal=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    const t=setTimeout(()=>Animated.timing(reveal,{toValue:1,duration:550,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start(),index*80);
    return()=>clearTimeout(t);
  },[]);
  return (
    <Animated.View style={{opacity:reveal,transform:[{translateY:reveal.interpolate({inputRange:[0,1],outputRange:[18,0]})}]}}>
      <View style={styles.sceneCard}>
        <View style={styles.chapterRow}>
          <LinearGradient colors={["#6D4CFF","#9A67FF"]} style={styles.numberCircle}><Text style={styles.numberText}>{String(index+1).padStart(2,"0")}</Text></LinearGradient>
          <View style={styles.chapterCopy}>
            <Text style={styles.chapterLabel}>SCENE {index+1}</Text>
            <Text style={styles.chapterSub}>{index===0?"The beginning":index===total-1?"The finale":"The journey continues"}</Text>
          </View>
        </View>
        <Text style={styles.paragraphText}>{paragraph.text}</Text>
        {paragraph.image ? (
          <View style={styles.imageFrame}>
            <Image source={{uri:paragraph.image}} style={styles.paragraphImage} resizeMode="cover"/>
            <View style={styles.imageTag}><Ionicons name="sparkles" size={12} color="#FFF"/><Text style={styles.imageTagText}>AI ILLUSTRATION</Text></View>
          </View>
        ) : (
          <View style={styles.imageUnavailable}>
            <View style={styles.imagePlaceholderIcon}><Ionicons name="image-outline" size={27} color="#8B7BEA"/></View>
            <Text style={styles.imageUnavailableTitle}>Illustration coming soon</Text>
            <Text style={styles.imageUnavailableText}>The story is ready even when this scene has no image.</Text>
          </View>
        )}
        {index<total-1&&<View style={styles.sceneDivider}><View style={styles.dividerLine}/><View style={styles.dividerIcon}><Ionicons name="sparkles" size={12} color="#8B7BEA"/></View><View style={styles.dividerLine}/></View>}
      </View>
    </Animated.View>
  );
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:"#F6F4FC"},glow:{position:"absolute",width:310,height:310,borderRadius:155,backgroundColor:"rgba(109,76,255,.08)",top:-120,right:-100},
  content:{padding:17,paddingTop:48,paddingBottom:46},topBar:{flexDirection:"row",alignItems:"center",marginBottom:14},
  iconButton:{width:42,height:42,borderRadius:14,backgroundColor:"#FFF",borderWidth:1,borderColor:"#EAE7F1",alignItems:"center",justifyContent:"center"},activeIcon:{backgroundColor:"#6D4CFF",borderColor:"#6D4CFF"},
  modeBadge:{marginLeft:10,flexDirection:"row",alignItems:"center",paddingHorizontal:11,height:36,borderRadius:999,backgroundColor:"#FFF",borderWidth:1,borderColor:"#EAE7F1"},dot:{width:7,height:7,borderRadius:4,backgroundColor:"#6D4CFF",marginRight:7},modeText:{color:"#716B82",fontSize:10,fontWeight:"900",letterSpacing:1.2},
  heroCard:{borderRadius:28,padding:22,minHeight:210,justifyContent:"flex-end",borderWidth:1,borderColor:"#FFF",shadowColor:"#5E557A",shadowOpacity:.1,shadowRadius:22,shadowOffset:{width:0,height:10},elevation:4},
  heroSpark:{position:"absolute",top:18,right:18,width:42,height:42,borderRadius:15,backgroundColor:"rgba(109,76,255,.1)",alignItems:"center",justifyContent:"center"},
  eyebrow:{color:"#7969C8",fontSize:10,fontWeight:"900",letterSpacing:1.7,marginBottom:9},title:{color:"#242137",fontSize:31,lineHeight:37,fontWeight:"900",paddingRight:28},meta:{color:"#817C90",fontSize:12,marginTop:10},
  actionRow:{flexDirection:"row",gap:10,marginVertical:13},actionButton:{flex:1,minHeight:48,borderRadius:15,backgroundColor:"#FFF",borderWidth:1,borderColor:"#E9E6F0",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},actionDark:{backgroundColor:"#6D4CFF",borderColor:"#6D4CFF"},actionText:{color:"#625B75",fontSize:13,fontWeight:"800"},actionTextWhite:{color:"#FFF"},
  storyStats:{backgroundColor:"#21183E",borderRadius:20,padding:17,marginBottom:14,flexDirection:"row",alignItems:"center",justifyContent:"space-around"},statValue:{color:"#FFF",fontSize:14,fontWeight:"900",textAlign:"center"},statLabel:{color:"#AFA5CA",fontSize:8,fontWeight:"900",letterSpacing:1.2,textAlign:"center",marginTop:4},statLine:{width:1,height:27,backgroundColor:"rgba(255,255,255,.13)"},
  sceneCard:{backgroundColor:"#FFF",borderRadius:24,padding:17,marginBottom:14,borderWidth:1,borderColor:"#EEEAF5",shadowColor:"#514A69",shadowOpacity:.055,shadowRadius:18,shadowOffset:{width:0,height:7},elevation:2},
  chapterRow:{flexDirection:"row",alignItems:"center",marginBottom:14},numberCircle:{width:43,height:43,borderRadius:15,alignItems:"center",justifyContent:"center"},numberText:{color:"#FFF",fontSize:12,fontWeight:"900"},chapterCopy:{marginLeft:11},chapterLabel:{color:"#514A68",fontSize:11,fontWeight:"900",letterSpacing:1.3},chapterSub:{color:"#A09AAA",fontSize:11,marginTop:2},
  paragraphText:{color:"#302C3F",fontSize:17,lineHeight:28,marginBottom:16},imageFrame:{borderRadius:19,overflow:"hidden",backgroundColor:"#ECEAF2",position:"relative"},paragraphImage:{width:"100%",aspectRatio:1},imageTag:{position:"absolute",top:10,left:10,flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:9,paddingVertical:6,borderRadius:999,backgroundColor:"rgba(20,16,38,.68)"},imageTagText:{color:"#FFF",fontSize:9,fontWeight:"900",letterSpacing:1},
  imageUnavailable:{minHeight:185,borderRadius:19,backgroundColor:"#F4F1FB",borderWidth:1,borderColor:"#E8E2F7",borderStyle:"dashed",alignItems:"center",justifyContent:"center",padding:22},imagePlaceholderIcon:{width:56,height:56,borderRadius:20,backgroundColor:"#EAE4FF",alignItems:"center",justifyContent:"center",marginBottom:10},imageUnavailableTitle:{color:"#5E5775",fontSize:14,fontWeight:"800"},imageUnavailableText:{color:"#9892A7",fontSize:11,lineHeight:17,textAlign:"center",marginTop:5,maxWidth:280},
  sceneDivider:{flexDirection:"row",alignItems:"center",marginTop:19},dividerLine:{flex:1,height:1,backgroundColor:"#EAE6F0"},dividerIcon:{width:28,height:28,borderRadius:14,backgroundColor:"#F1EDFF",alignItems:"center",justifyContent:"center",marginHorizontal:9},
  endCard:{alignItems:"center",backgroundColor:"#EEE9FF",borderRadius:25,padding:25,marginTop:2,borderWidth:1,borderColor:"#E1D9FF"},endIcon:{width:58,height:58,borderRadius:20,backgroundColor:"#FFF",alignItems:"center",justifyContent:"center",marginBottom:10},endEmoji:{fontSize:29},endTitle:{fontSize:22,fontWeight:"900",color:"#332C4D"},endText:{marginTop:7,color:"#7E7792",fontSize:12,textAlign:"center",lineHeight:18,maxWidth:300},createAnother:{marginTop:16,minHeight:44,paddingHorizontal:15,borderRadius:14,backgroundColor:"#FFF",flexDirection:"row",alignItems:"center",gap:8},createAnotherText:{color:"#6D4CFF",fontSize:12,fontWeight:"900"},
  loader:{flex:1,alignItems:"center",justifyContent:"center",padding:30},loaderOrb:{width:92,height:92,borderRadius:46,backgroundColor:"rgba(255,255,255,.12)",borderWidth:1,borderColor:"rgba(255,255,255,.18)",alignItems:"center",justifyContent:"center",marginBottom:22},loaderEmoji:{fontSize:40},loadingTitle:{color:"#FFF",fontSize:24,fontWeight:"900",textAlign:"center"},loadingText:{color:"#D8D1F1",fontSize:14,lineHeight:21,textAlign:"center",marginTop:8,maxWidth:330},loadingBar:{width:220,height:5,borderRadius:5,backgroundColor:"rgba(255,255,255,.15)",overflow:"hidden",marginTop:24},loadingFill:{width:"55%",height:"100%",backgroundColor:"#FFF",borderRadius:5},loadingHint:{color:"#B9B0D9",fontSize:11,marginTop:10}
});