import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";

const LANGUAGES=["English","Hindi","Marathi","Urdu"];
const STORY_TYPES=["Adventure","Moral","Funny","Fairy Tale","Fantasy","Animal Story","Space Story","Inspirational","Educational","Friendship","Bedtime","Mystery (Kids Friendly)","Other"];
const AGE_GROUPS=["Kids","Teens","Adults"];

export default function CreateStory(){
  const router=useRouter();
  const [character,setCharacter]=useState("");
  const [storyType,setStoryType]=useState("");
  const [customType,setCustomType]=useState("");
  const [ageGroup,setAgeGroup]=useState("");
  const [language,setLanguage]=useState("English");
  const intro=useRef(new Animated.Value(0)).current;
  const buttonScale=useRef(new Animated.Value(1)).current;

  useEffect(()=>{Animated.timing(intro,{toValue:1,duration:700,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start();},[]);

  const handleGenerate=()=>{
    const finalType=storyType==="Other"?customType:storyType;
    if(!character||!finalType||!ageGroup){alert("Please fill all fields!");return;}
    router.push({pathname:"/story-viewer",params:{character,storyType:finalType,ageGroup,language}});
  };

  return <LinearGradient colors={["#F8F7FF","#F0EEFF","#EAF7FF"]} style={styles.container}>
    <View pointerEvents="none" style={styles.topGlow}/><View pointerEvents="none" style={styles.bottomGlow}/>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Animated.View style={{opacity:intro,transform:[{translateY:intro.interpolate({inputRange:[0,1],outputRange:[28,0]})}]}}>
        <View style={styles.topBar}>
          <Pressable onPress={()=>router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={20} color="#29263E"/></Pressable>
          <View style={styles.topTitleWrap}><Text style={styles.eyebrow}>STORY STUDIO</Text><Text style={styles.heading}>Create your story</Text></View>
          <View style={styles.sparkleBadge}><Ionicons name="sparkles" size={17} color="#6D4CFF"/></View>
        </View>
        <Text style={styles.heroText}>Give us a character and a direction. StoryGenie will take it from there.</Text>

        <View style={styles.card}>
          <View style={styles.sectionHeader}><View style={styles.sectionIcon}><Ionicons name="person-outline" size={19} color="#6D4CFF"/></View><View><Text style={styles.sectionTitle}>The main character</Text><Text style={styles.sectionHint}>Who is your story about?</Text></View></View>
          <TextInput style={styles.input} placeholder="e.g. Aria, a curious space explorer" placeholderTextColor="#A09DB1" value={character} onChangeText={setCharacter}/>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}><View style={styles.sectionIcon}><Ionicons name="color-wand-outline" size={19} color="#6D4CFF"/></View><View><Text style={styles.sectionTitle}>Story direction</Text><Text style={styles.sectionHint}>Pick a world and tone</Text></View></View>
          <Text style={styles.fieldLabel}>Story type</Text>
          <View style={styles.pickerShell}><RNPickerSelect value={storyType} onValueChange={setStoryType} items={STORY_TYPES.map(t=>({label:t,value:t}))} placeholder={{label:"Select a story type",value:""}} style={{inputIOS:styles.picker,inputAndroid:styles.picker,placeholder:{color:"#9995A8"}}}/></View>
          {storyType==="Other"&&<TextInput style={styles.input} placeholder="Describe your custom story type" placeholderTextColor="#A09DB1" value={customType} onChangeText={setCustomType}/>}
          <Text style={styles.fieldLabel}>Age group</Text>
          <View style={styles.chipRow}>{AGE_GROUPS.map(age=><Pressable key={age} onPress={()=>setAgeGroup(age)} style={[styles.chip,ageGroup===age&&styles.chipActive]}><Text style={[styles.chipText,ageGroup===age&&styles.chipTextActive]}>{age}</Text></Pressable>)}</View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}><View style={styles.sectionIcon}><Ionicons name="language-outline" size={19} color="#6D4CFF"/></View><View><Text style={styles.sectionTitle}>Story language</Text><Text style={styles.sectionHint}>Choose how your story reads</Text></View></View>
          <View style={styles.languageGrid}>{LANGUAGES.map(lang=><Pressable key={lang} onPress={()=>setLanguage(lang)} style={[styles.languageCard,language===lang&&styles.languageCardActive]}><Text style={[styles.languageText,language===lang&&styles.languageTextActive]}>{lang}</Text>{language===lang&&<View style={styles.check}><Ionicons name="checkmark" size={12} color="#FFFFFF"/></View>}</Pressable>)}</View>
        </View>

        <Animated.View style={{transform:[{scale:buttonScale}]}}>
          <Pressable onPressIn={()=>Animated.spring(buttonScale,{toValue:.98,useNativeDriver:true}).start()} onPressOut={()=>Animated.spring(buttonScale,{toValue:1,friction:6,useNativeDriver:true}).start()} onPress={handleGenerate}>
            <LinearGradient colors={["#6D4CFF","#9A67FF"]} style={styles.generateButton}>
              <View><Text style={styles.generateTitle}>Generate my story</Text><Text style={styles.generateSub}>AI will write and illustrate it</Text></View>
              <View style={styles.generateIcon}><Ionicons name="arrow-forward" size={22} color="#6D4CFF"/></View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
        <Text style={styles.bottomNote}>✦ Your choices shape the story's characters, tone and language.</Text>
      </Animated.View>
    </ScrollView>
  </LinearGradient>;
}

const styles=StyleSheet.create({
  container:{flex:1},scrollContent:{paddingHorizontal:18,paddingTop:54,paddingBottom:42},
  topGlow:{position:"absolute",width:250,height:250,borderRadius:125,backgroundColor:"rgba(123,93,255,0.10)",top:-100,right:-80},
  bottomGlow:{position:"absolute",width:220,height:220,borderRadius:110,backgroundColor:"rgba(65,206,255,0.10)",bottom:-90,left:-100},
  topBar:{flexDirection:"row",alignItems:"center",marginBottom:18},backButton:{width:44,height:44,borderRadius:15,backgroundColor:"rgba(255,255,255,0.88)",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"#E8E5F2"},
  topTitleWrap:{flex:1,marginLeft:12},eyebrow:{fontSize:10,fontWeight:"900",letterSpacing:1.7,color:"#8A84A1"},heading:{fontSize:27,lineHeight:32,fontWeight:"900",color:"#242137",marginTop:2},
  sparkleBadge:{width:44,height:44,borderRadius:15,backgroundColor:"#EEE9FF",alignItems:"center",justifyContent:"center"},heroText:{color:"#77728B",fontSize:14,lineHeight:21,marginBottom:18,maxWidth:520},
  card:{backgroundColor:"rgba(255,255,255,0.86)",borderRadius:24,padding:18,marginBottom:14,borderWidth:1,borderColor:"rgba(255,255,255,0.9)",shadowColor:"#5E557A",shadowOpacity:.07,shadowRadius:20,shadowOffset:{width:0,height:8},elevation:3},
  sectionHeader:{flexDirection:"row",alignItems:"center",marginBottom:15},sectionIcon:{width:42,height:42,borderRadius:14,backgroundColor:"#F0ECFF",alignItems:"center",justifyContent:"center",marginRight:11},
  sectionTitle:{fontSize:15,fontWeight:"900",color:"#2B2840"},sectionHint:{color:"#8C889C",fontSize:12,marginTop:2},input:{backgroundColor:"#F8F7FC",borderWidth:1,borderColor:"#E8E5F0",borderRadius:16,paddingHorizontal:15,paddingVertical:14,fontSize:15,color:"#29263E"},
  fieldLabel:{color:"#69647D",fontSize:12,fontWeight:"800",marginBottom:7,marginTop:3},pickerShell:{backgroundColor:"#F8F7FC",borderWidth:1,borderColor:"#E8E5F0",borderRadius:16,marginBottom:14,overflow:"hidden"},picker:{paddingHorizontal:13,paddingVertical:13,fontSize:15,color:"#29263E"},
  chipRow:{flexDirection:"row",gap:9},chip:{flex:1,borderRadius:14,paddingVertical:12,alignItems:"center",backgroundColor:"#F7F6FA",borderWidth:1,borderColor:"#E9E6F0"},chipActive:{backgroundColor:"#6D4CFF",borderColor:"#6D4CFF"},chipText:{color:"#777287",fontWeight:"700",fontSize:13},chipTextActive:{color:"#FFFFFF"},
  languageGrid:{flexDirection:"row",flexWrap:"wrap",gap:9},languageCard:{width:"48%",minHeight:52,borderRadius:15,paddingHorizontal:13,backgroundColor:"#F8F7FC",borderWidth:1,borderColor:"#E9E6F0",flexDirection:"row",alignItems:"center"},languageCardActive:{backgroundColor:"#F0ECFF",borderColor:"#B8A8FF"},languageText:{flex:1,color:"#5F5A70",fontWeight:"800",fontSize:13},languageTextActive:{color:"#6243E8"},
  check:{width:21,height:21,borderRadius:11,backgroundColor:"#6D4CFF",alignItems:"center",justifyContent:"center"},generateButton:{minHeight:72,borderRadius:22,paddingHorizontal:17,flexDirection:"row",alignItems:"center",justifyContent:"space-between",shadowColor:"#6D4CFF",shadowOpacity:.24,shadowRadius:18,shadowOffset:{width:0,height:10},elevation:7},
  generateTitle:{color:"#FFFFFF",fontSize:16,fontWeight:"900"},generateSub:{color:"#E6DDFF",fontSize:12,marginTop:3},generateIcon:{width:44,height:44,borderRadius:15,backgroundColor:"#FFFFFF",alignItems:"center",justifyContent:"center"},bottomNote:{color:"#8D899D",fontSize:11,textAlign:"center",lineHeight:18,marginTop:16,paddingHorizontal:20}
});