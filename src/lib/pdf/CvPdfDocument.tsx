import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Styles de base
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
  },
  minimal: {
    color: "#000000",
  },
  "sobre-color": {
    color: "#1e293b",
  },
  "modern-color": {
    color: "#0f172a",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 15,
  },
  headerMinimal: {
    borderBottomColor: "#000000",
  },
  headerSobre: {
    borderBottomColor: "#3b82f6",
  },
  headerModern: {
    borderBottomColor: "#2563eb",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  contact: {
    fontSize: 9,
    color: "#64748b",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitleMinimal: {
    color: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 3,
  },
  sectionTitleSobre: {
    color: "#3b82f6",
    borderBottomWidth: 1,
    borderBottomColor: "#3b82f6",
    paddingBottom: 3,
  },
  sectionTitleModern: {
    color: "#2563eb",
    borderBottomWidth: 1,
    borderBottomColor: "#2563eb",
    paddingBottom: 3,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#334155",
    marginBottom: 10,
  },
  item: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  itemSubtitle: {
    fontSize: 9,
    color: "#64748b",
    fontStyle: "italic",
  },
  itemDate: {
    fontSize: 9,
    color: "#64748b",
  },
  itemDetails: {
    fontSize: 9,
    color: "#475569",
    marginTop: 3,
  },
  bullet: {
    fontSize: 9,
    color: "#475569",
    marginLeft: 10,
    marginBottom: 2,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 5,
  },
  skillTag: {
    fontSize: 8,
    padding: "3 6",
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
  },
  skillTagSobre: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  skillTagModern: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 48,
    color: "#e2e8f0",
    opacity: 0.3,
    fontWeight: "bold",
  },
});

interface CvPdfDocumentProps {
  cvData: any;
  hasWatermark?: boolean;
}

export const CvPdfDocument: React.FC<CvPdfDocumentProps> = ({ cvData, hasWatermark = false }) => {
  const templateStyle = cvData?.templateStyle || "minimal";
  const accentColor = cvData?.accentColor || "#2563eb";

  const getSectionTitleStyle = () => {
    switch (templateStyle) {
      case "sobre-color":
        return [styles.sectionTitle, styles.sectionTitleSobre];
      case "modern-color":
        return [styles.sectionTitle, styles.sectionTitleModern];
      default:
        return [styles.sectionTitle, styles.sectionTitleMinimal];
    }
  };

  const getHeaderStyle = () => {
    switch (templateStyle) {
      case "sobre-color":
        return [styles.header, styles.headerSobre];
      case "modern-color":
        return [styles.header, styles.headerModern];
      default:
        return [styles.header, styles.headerMinimal];
    }
  };

  const getSkillTagStyle = () => {
    if (templateStyle === "sobre-color" || templateStyle === "modern-color") {
      return [styles.skillTag, styles.skillTagSobre];
    }
    return styles.skillTag;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {hasWatermark && (
          <View style={styles.watermark}>
            <Text>CANDIDATURE AI</Text>
          </View>
        )}

        {/* Header */}
        {cvData?.header && (
          <View style={getHeaderStyle()}>
            <Text style={styles.name}>{cvData.header.fullName || ""}</Text>
            {cvData.header.targetTitle && (
              <Text style={styles.title}>{cvData.header.targetTitle}</Text>
            )}
            <View style={styles.contact}>
              {cvData.header.contact?.email && <Text>{cvData.header.contact.email}</Text>}
              {cvData.header.contact?.phone && <Text> • {cvData.header.contact.phone}</Text>}
              {cvData.header.city && <Text> • {cvData.header.city}</Text>}
            </View>
          </View>
        )}

        {/* Summary */}
        {cvData?.summary && (
          <View style={styles.section}>
            <Text style={styles.summary}>{cvData.summary}</Text>
          </View>
        )}

        {/* Education */}
        {cvData?.education && cvData.education.length > 0 && (
          <View style={styles.section}>
            <Text style={getSectionTitleStyle()}>Formation</Text>
            {cvData.education.map((edu: any, idx: number) => (
              <View key={idx} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{edu.degree || ""}</Text>
                    <Text style={styles.itemSubtitle}>{edu.school || ""}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {edu.startDate || ""} {edu.endDate ? `→ ${edu.endDate}` : ""}
                  </Text>
                </View>
                {edu.details && <Text style={styles.itemDetails}>{edu.details}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {cvData?.experience && cvData.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={getSectionTitleStyle()}>Expérience</Text>
            {cvData.experience.map((exp: any, idx: number) => (
              <View key={idx} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{exp.title || ""}</Text>
                    <Text style={styles.itemSubtitle}>{exp.company || ""}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {exp.startDate || ""} {exp.endDate ? `→ ${exp.endDate}` : ""}
                  </Text>
                </View>
                {exp.bullets &&
                  exp.bullets.map((bullet: string, bIdx: number) => (
                    <Text key={bIdx} style={styles.bullet}>
                      • {bullet}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {cvData?.projects && cvData.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={getSectionTitleStyle()}>Projets</Text>
            {cvData.projects.map((proj: any, idx: number) => (
              <View key={idx} style={styles.item}>
                <Text style={styles.itemTitle}>{proj.name || ""}</Text>
                {proj.context && <Text style={styles.itemSubtitle}>{proj.context}</Text>}
                {proj.bullets &&
                  proj.bullets.map((bullet: string, bIdx: number) => (
                    <Text key={bIdx} style={styles.bullet}>
                      • {bullet}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {cvData?.skills && (
          <View style={styles.section}>
            <Text style={getSectionTitleStyle()}>Compétences</Text>
            {cvData.skills.hardSkills && cvData.skills.hardSkills.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 3 }}>
                  Techniques :
                </Text>
                <View style={styles.skillsRow}>
                  {cvData.skills.hardSkills.map((skill: string, idx: number) => (
                    <Text key={idx} style={getSkillTagStyle()}>
                      {skill}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            {cvData.skills.softSkills && cvData.skills.softSkills.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 3 }}>
                  Humaines :
                </Text>
                <View style={styles.skillsRow}>
                  {cvData.skills.softSkills.map((skill: string, idx: number) => (
                    <Text key={idx} style={getSkillTagStyle()}>
                      {skill}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            {cvData.skills.tools && cvData.skills.tools.length > 0 && (
              <View>
                <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 3 }}>
                  Outils :
                </Text>
                <View style={styles.skillsRow}>
                  {cvData.skills.tools.map((tool: string, idx: number) => (
                    <Text key={idx} style={getSkillTagStyle()}>
                      {tool}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Languages */}
        {cvData?.languages && cvData.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={getSectionTitleStyle()}>Langues</Text>
            {cvData.languages.map((lang: any, idx: number) => (
              <Text key={idx} style={styles.itemDetails}>
                {lang.name || ""} : {lang.level || ""}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

