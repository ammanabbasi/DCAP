import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import LoadingModal from '../../Components/LoadingModal';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import DropDown from '../../Components/DropDown';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import QuillEditor, {QuillToolbar} from 'react-native-cn-quill';
import Typography from '../../Theme/Typography';
import {sendEmail, crmDropdowns} from '../../Services/apis/APIs';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
const AddEmail = (props: any) => {
  const params = props?.route?.params;
  console.log('params=================>:', JSON.stringify(params));
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [templateValue, setTemplateValue] = useState<string | undefined>();
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const [file, setFile] = useState<any>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [dropdownData, setDropdownData] = useState<{label: string; value: string}[]>([]);
  const [templateData, setTemplateData] = useState<any[]>([]);
  const editorRef = useRef();

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (templateValue && templateData.length > 0) {
      const selectedTemplate = templateData.find(
        (template: any) => template.EmailTemplateID?.toString() === templateValue?.toString()
      );
      
      if (selectedTemplate && selectedTemplate.TemplateContent) {
        console.log('Loading template content via useEffect:', selectedTemplate.TemplateContent);
        
        setTimeout(() => {
          try {
            const editor = editorRef.current as any;
            if (editor) {
              console.log('Editor methods available:', Object.keys(editor));
              
              // Try to get the Quill instance
              const quillInstance = editor.getEditor ? editor.getEditor() : editor;
              console.log('Quill instance:', quillInstance);
              
              if (quillInstance && quillInstance.clipboard && quillInstance?.clipboard?.dangerouslyPasteHTML) {
                // Clear editor first
                quillInstance.setContents([]);
                // Insert HTML content
                quillInstance?.clipboard?.dangerouslyPasteHTML(0, selectedTemplate.TemplateContent);
                console.log('Used quillInstance?.clipboard?.dangerouslyPasteHTML');
              } else if (quillInstance && quillInstance.dangerouslyPasteHTML) {
                quillInstance.setContents([]);
                quillInstance.dangerouslyPasteHTML(0, selectedTemplate.TemplateContent);
                console.log('Used quillInstance.dangerouslyPasteHTML');
              } else if (editor.setHtml) {
                editor.setHtml(selectedTemplate.TemplateContent);
                console.log('Used editor.setHtml');
              } else {
                // Fallback: try to insert as Delta operations
                const delta = quillInstance?.clipboard?.convert(selectedTemplate.TemplateContent);
                quillInstance.setContents(delta);
                console.log('Used delta conversion');
              }
            }
          } catch (error: any) {
            console.log('Error in useEffect template loading:', error);
          }
        }, 500);
      }
    }
  }, [templateValue, templateData]);

  const fetchDropdownData = async () => {
    try {
      console.log('Fetching dropdown data...');
      const response = await crmDropdowns();
      console.log('Full dropdown response:', JSON.stringify(response, null, 2));
      console.log('Response data:', response?.data);
      console.log('Response data structure:', JSON.stringify(response?.data, null, 2));
      
      if (response?.data) {
        // Check different possible response structures
        let templateArray = null;
        
        if (response?.data?.template) {
          templateArray = response?.data?.template;
        } else if (response?.data?.data && response?.data?.data.template) {
          templateArray = response?.data?.data.template;
        } else if (response?.data?.success && response?.data?.data && response?.data?.data.template) {
          templateArray = response?.data?.data.template;
        }
        
        console.log('Template array found:', templateArray);
        
                          if (templateArray && Array.isArray(templateArray)) {
           // Store the complete template data
           setTemplateData(templateArray);
           
           // Create dropdown options
           const dropdownOptions = templateArray.map((item: any) => ({
             label: item.TemplateName || `Template ${item.EmailTemplateID}`,
             value: item.EmailTemplateID?.toString() || item.EmailTemplateID,
           }));
           console.log('Processed dropdown options:', dropdownOptions);
           setDropdownData(dropdownOptions);
         } else {
          console.log('No template array found or invalid structure');
          // Fallback data for testing
          setDropdownData([
            {label: 'Default Template', value: 'default'},
            {label: 'Test Template', value: 'test'},
          ]);
        }
      }
    } catch (error: any) {
      console.log('Error fetching dropdown data:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      // Set fallback data on error
      setDropdownData([
        {label: 'Default Template', value: 'default'},
        {label: 'Test Template', value: 'test'},
      ]);
    }
  };

  const handleTemplateSelection = (selectedValue: any) => {
    console.log('Template selected:', selectedValue);
    setTemplateValue(selectedValue);
    
    // Find the selected template from the stored template data
    const selectedTemplate = templateData.find(
      (template: any) => template.EmailTemplateID?.toString() === selectedValue?.toString()
    );
    
    console.log('Selected template object:', selectedTemplate);
    console.log('Template content to load:', selectedTemplate?.TemplateContent);
    console.log('Editor ref current:', editorRef.current);
    
    if (selectedTemplate && selectedTemplate.TemplateContent) {
      // Set the template content in the QuillEditor
      setTimeout(() => {
        try {
          if (editorRef.current) {
            const editor = editorRef.current as any;
            console.log('Available editor methods:', Object.keys(editor));
            
            // Get the actual Quill instance
            const quillInstance = editor.getEditor ? editor.getEditor() : editor;
            
            if (quillInstance && quillInstance.clipboard && quillInstance?.clipboard?.dangerouslyPasteHTML) {
              quillInstance.setContents([]);
              quillInstance?.clipboard?.dangerouslyPasteHTML(0, selectedTemplate.TemplateContent);
              console.log('Used quillInstance?.clipboard?.dangerouslyPasteHTML method');
            } else if (quillInstance && quillInstance.dangerouslyPasteHTML) {
              quillInstance.setContents([]);
              quillInstance.dangerouslyPasteHTML(0, selectedTemplate.TemplateContent);
              console.log('Used quillInstance.dangerouslyPasteHTML method');
            } else if (editor.setHtml) {
              editor.setHtml(selectedTemplate.TemplateContent);
              console.log('Used editor.setHtml method');
            } else {
              console.log('No suitable method found to set content');
              console.log('QuillInstance methods:', quillInstance ? Object.keys(quillInstance) : 'No quill instance');
            }
            
            console.log('Template content loaded into editor');
          } else {
            console.log('Editor ref is null');
          }
        } catch (error: any) {
          console.log('Error setting template content:', error);
        }
      }, 100); // Small delay to ensure editor is ready
    } else {
      console.log('No template found or no content');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker?.types?.allFiles],
      });
      setFile(result?.[0] as any);
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled document picker');
      } else {
        console.error('Unknown error: ', err);
      }
    }
  };
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  const onSave = async (data: any) => {
    try {
      setIsModalLoading(true);

      const quillText = await editorRef.current?.getHtml();
      const plainText = stripHtmlTags(quillText || '');
      console.log('Quill Editor Content:', quillText);
      console.log('Plain Text Content:', plainText);


      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Session expired',
          text2: 'Please log in again.',
        });
        navigation.navigate('Login' as never); // or your login screen
        return;
      }
      const formData = new FormData();
      formData.append('to', data.to ? data.to : '');
      formData.append('cc', data.cc ? data.cc : '');
      formData.append('bcc', data.bcc ? data.bcc : '');
      formData.append('subject', data.subject ? data.subject : '');
      formData.append('text', plainText ? plainText : '');
      formData.append('customerID', params?.item?.customerID); // Assuming customerID is 1

      console.log('FORM DATA data=================>:', data);

      if (file) {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      }
      console.log('FORM DATA:', formData);
      const response = await sendEmail(formData);
      console.log('EMAIL RESPONSE:', response?.data);
      if (response?.data?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.data?.message || 'Email sent successfully!',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.data?.error || 'Failed to send email.',
        });
      }
    } catch (error: any) {
      console.log((error as any)?.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (error as any)?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };
  const toolbarStyles = {
    toolbar: {
      provider: (provided: any) => ({
        ...provided,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        backgroundColor: Colors.dullWhite,
      }),
      root: (provided: any) => ({
        ...provided,
        backgroundColor: Colors.dullWhite,
      }),
      toolset: {
        root: (provided: any) => ({
          ...provided,
          backgroundColor: Colors.dullWhite,
        }),
        listButton: {
          overlay: (provided: any) => ({
            ...provided,
          }),
          tool: (provided: any) => ({
            ...provided,
          }),
          text: (provided: any) => ({
            ...provided,
          }),
          image: (provided: any) => ({
            ...provided,
          }),
        },
        colorListButton: {
          overlay: (provided: any) => ({
            ...provided,
          }),
          tool: (provided: any) => ({
            ...provided,
          }),
          image: (provided: any) => ({
            ...provided,
          }),
        },
      },
    },
    separator: (provided: any) => ({
      ...provided,
    }),
    selection: {
      root: (provided: any) => ({
        ...provided,
        backgroundColor: Colors.dullWhite,
      }),
      scroll: (provided: any) => ({
        ...provided,
      }),
      close: {
        view: (provided: any) => ({
          ...provided,
        }),
        text: (provided: any) => ({
          ...provided,
        }),
      },
      textToggle: {
        overlay: (provided: any) => ({
          ...provided,
        }),
        tool: (provided: any) => ({
          ...provided,
        }),
        text: (provided: any) => ({
          ...provided,
        }),
      },
      iconToggle: {
        overlay: (provided: any) => ({
          ...provided,
        }),
        tool: (provided: any) => ({
          ...provided,
        }),
        image: (provided: any) => ({
          ...provided,
        }),
      },
      colorToggle: {
        overlay: (provided: any) => ({
          ...provided,
        }),
        tool: (provided: any) => ({
          ...provided,
        }),
        noColor: (provided: any) => ({
          ...provided,
        }),
      },
    },
  };
  return (
    <View style={styles.mainView}>
      <Header
        title={`Email`}
        leftIcn={icn.back}
        style={styles.subContainer}
        leftIcnStyle={styles.backIcn}
        onLeftIconPress={() => navigation.goBack()}
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: hp(5),
          paddingHorizontal: wp(3),
        }}>
        <Text style={styles.placeholderText}>To</Text>
        <Controller
          control={control}
          rules={{
            required: 'To is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="example@gamil.com"
              numberOfCharacter={280}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="to"
        />
        {formState?.errors?.to && (
          <Text style={styles.error}>To is required</Text>
        )}
        <Text style={styles.placeholderText}>CC</Text>
        <Controller
          control={control}
          rules={{
            required: 'CC is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="CC"
              numberOfCharacter={280}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="cc"
        />
        {/* {formState?.errors?.cc && (
          <Text style={styles.error}>CC is required</Text>
        )} */}
        <Text style={styles.placeholderText}>BCC</Text>
        <Controller
          control={control}
          rules={{
            required: 'BCC is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="BCC"
              numberOfCharacter={280}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="bcc"
        />
        {/* {formState?.errors?.bcc && (
          <Text style={styles.error}>BCC is required</Text>
        )} */}
        <Text style={styles.placeholderText}>Subject</Text>
        <Controller
          control={control}
          rules={{
            required: 'Subject is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="2012 ALFA ROMEO GIULIA (#3609876)"
              numberOfCharacter={280}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="subject"
        />
        {formState?.errors?.subject && (
          <Text style={styles.error}>Subject is required</Text>
        )}
        <View style={styles.dottedView}>
          <TouchableOpacity style={styles.verticalAlign} onPress={pickDocument}>
            <Image
              resizeMode="contain"
              source={icn.documentUpload}
              style={styles.imgPicker}
            />
            <Text style={styles.dropText}>
              Drop your image here, or <Text style={styles.browse}>Browse</Text>
            </Text>
            <Text style={styles.dropSubText}>Maximum file size 50mb</Text>
          </TouchableOpacity>
        </View>
        {file && (
          <View style={styles.fileInfoContainer}>
            <Text style={styles.fileName}>{(file as any)?.name}</Text>
          </View>
        )}
        <Text style={styles.placeholderText}>Template</Text>
        <DropDown
          data={dropdownData}
          placeholder={'Select'}
          value={templateValue}
          setValue={handleTemplateSelection}
          rightIcon
        />
        <View style={styles.bottomActionContainer}>
          <Text style={styles.simplePlaceholder}>SMS</Text>
          <TouchableOpacity style={styles.actionButtonContainer}>
            <Image
              style={styles.actionIcn}
              source={icn.plus}
              resizeMode="contain"
            />
            <Text style={styles.actionText}>Action</Text>
            <Image
              style={styles.actionIcn}
              source={icn.downWhiteArrow}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.editorContainer}>
          <QuillToolbar
            styles={toolbarStyles}
            editor={editorRef as any}
            options="full"
            theme="light"
            container={false}
          />
          <View style={styles.line}></View>
          <QuillEditor
            style={styles.editor}
            quill={{
              placeholder: 'Description...',
              modules: {
                toolbar: false,
              },
            }}
            ref={editorRef as any}
            theme={{
              background: Colors.dullWhite,
              color: Colors.black,
              placeholder: Colors.placeholderText,
            }}
          />
        </View>
        <PrimaryButton
          style={styles.button}
          title="Send"
          onPress={handleSubmit(onSave)}
        />
      </KeyboardAwareScrollView>
      {isModalLoading && <LoadingModal visible={isModalLoading} message="Sending email..."  />}
    </View>
  );
};

export default AddEmail;
